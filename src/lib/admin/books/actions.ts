'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl, BOOK_PHOTOS_BUCKET } from '@/lib/storage'
import { getAdminBookPhotos, type AdminEditionPhotos } from '@/api/admin/books'
import { isBookPhotoFolder, BOOK_PHOTO_FOLDERS } from '@/consts/bookPhotos'
import { EDITION_FILE_FOLDER, EDITION_HAS_DEMO, EDITION_WORKERS_TABLE, EDITION_WORKERS_FK } from '@/lib/admin/bookProducts'
import type { Json } from '@/types/supabase'

export type AdminActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }
export type PhotosResult = { status: 'ok'; photos: AdminEditionPhotos } | { status: 'error'; message: string }

const EDITION_TABLES = ['Ebooks', 'Audiobooks', 'PrintedBooks', 'CardBooks'] as const
type EditionTable = (typeof EDITION_TABLES)[number]
const HAS_SOLD_OUT = new Set<EditionTable>(['PrintedBooks', 'CardBooks'])

const coreSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug'),
  description: z.string().optional(),
  thesis: z.string().optional(),
  ageRestriction: z.coerce.number().int().min(0).max(21).optional(),
  firstRelease: z.string().optional(),
  litForm: z.string().optional(),
  isCompilation: z.boolean(),
})

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = (v as string | null)?.trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

type EditionUpdate = { price: number | null; discount: number | null; is_published: boolean; sold_out?: boolean }

// A bound, loosely-typed write handle for an edition table (the table name is
// dynamic, so supabase-js can't infer the row type).
type EditionWriter = {
  update: (v: EditionUpdate) => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  delete: () => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
}

// Save the Title's own fields. Products (editions) are managed separately.
export async function updateBookAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  const user = await requireAdmin()

  const parsed = coreSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: (formData.get('description') as string) || undefined,
    thesis: (formData.get('thesis') as string) || undefined,
    ageRestriction: (formData.get('ageRestriction') as string) || undefined,
    firstRelease: (formData.get('firstRelease') as string) || undefined,
    litForm: (formData.get('litForm') as string) || undefined,
    isCompilation: formData.get('isCompilation') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  // «Периодика»: which periodical this title is an issue of, and its volume/year.
  const periodicalId = numOrNull(formData.get('periodicalId'))
  const volumeNumber = numOrNull(formData.get('volumeNumber'))
  const volumeYearRaw = (formData.get('volumeYear') as string | null)?.trim()

  const admin = createAdminClient()

  const { error: titleError } = await admin
    .from('Titles')
    .update({
      name: d.name,
      slug: d.slug,
      description: d.description ?? null,
      thesis: d.thesis ?? null,
      age_restriction: d.ageRestriction ?? null,
      first_release: d.firstRelease ?? null,
      lit_form: d.litForm ?? null,
      is_compilation: d.isCompilation,
      periodical_id: periodicalId,
      volume_number: volumeNumber,
      volume_year: volumeYearRaw ? volumeYearRaw : null,
    })
    .eq('id', d.id)
  if (titleError) return { status: 'error', message: titleError.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'book.update',
    entityType: 'book',
    entityId: String(d.id),
    summary: `Изменена книга «${d.name}»`,
  })

  revalidatePath(`/admin/books/${d.id}`)
  revalidatePath('/admin/books')
  revalidatePath(`/books/${d.slug}`)
  return { status: 'ok' }
}

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
const MAX_COVER_BYTES = 20 * 1024 * 1024

// Upload a cover to the `covers` bucket, generate its blur, and point the Title
// at the new object key. Returns the public URL for the uploader preview.
export async function uploadBookCoverAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()

  const titleId = Number(formData.get('titleId'))
  const file = formData.get('file')
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_COVER_BYTES) return { status: 'error', message: 'Файл больше 20 МБ.' }

  const admin = createAdminClient()
  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  const base = title?.slug || `title-${titleId}`
  const filename = `${base}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from('covers')
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  let blur: string | null = null
  try {
    blur = await makeBlurDataUrl(buffer)
  } catch {
    blur = null
  }

  const { error: updateError } = await admin
    .from('Titles')
    .update({ cover: filename, cover_blur: blur })
    .eq('id', titleId)
  if (updateError) return { status: 'error', message: updateError.message }

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath('/admin/books')
  return { status: 'ok', url: `${getCoverUrl(filename)}?v=${Date.now()}` }
}

const MAX_PHOTO_BYTES = 20 * 1024 * 1024

function asStringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') out[k] = v
  }
  return out
}

// Next numeric filename index in the book-photos/{slug}/ folder.
function nextPhotoIndex(names: string[]): number {
  let max = 0
  for (const n of names) {
    const m = n.match(/^(\d+)/)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return max + 1
}

// Add a photo to the book's gallery (book-photos/{slug}/), generate its blur
// into Titles.book_photos_blurs, and return the refreshed gallery.
export async function uploadBookPhotoAction(formData: FormData): Promise<PhotosResult> {
  await requireAdmin()

  const titleId = Number(formData.get('titleId'))
  const file = formData.get('file')
  const folder = formData.get('folder')
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!isBookPhotoFolder(folder)) return { status: 'error', message: 'Неверный раздел фото.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_PHOTO_BYTES) return { status: 'error', message: 'Файл больше 20 МБ.' }

  const admin = createAdminClient()
  const { data: title } = await admin
    .from('Titles')
    .select('slug, book_photos_blurs')
    .eq('id', titleId)
    .maybeSingle()
  const slug = title?.slug
  if (!slug) return { status: 'error', message: 'Сначала задайте slug книги и сохраните.' }

  const { data: existing } = await admin.storage.from(BOOK_PHOTOS_BUCKET).list(`${slug}/${folder}`)
  const names = (existing ?? []).map((f) => f.name).filter((n) => n && !n.startsWith('.'))
  const filename = `${nextPhotoIndex(names)}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(BOOK_PHOTOS_BUCKET)
    .upload(`${slug}/${folder}/${filename}`, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const blurs = asStringMap(title?.book_photos_blurs)
  try {
    blurs[`${folder}/${filename}`] = await makeBlurDataUrl(buffer)
  } catch {
    // leave blur out; the carousel falls back to no placeholder
  }
  await admin.from('Titles').update({ book_photos_blurs: blurs as unknown as Json }).eq('id', titleId)

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath(`/books/${slug}`)
  return { status: 'ok', photos: await getAdminBookPhotos(slug) }
}

// Remove a gallery photo + its blur entry; return the refreshed gallery.
export async function deleteBookPhotoAction(formData: FormData): Promise<PhotosResult> {
  await requireAdmin()

  const titleId = Number(formData.get('titleId'))
  const name = (formData.get('name') as string | null)?.trim()
  const folder = formData.get('folder')
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!isBookPhotoFolder(folder)) return { status: 'error', message: 'Неверный раздел фото.' }
  // Basename only — never let a path escape the title's folder.
  if (!name || name.includes('/') || name.includes('..')) return { status: 'error', message: 'Неверное имя файла.' }

  const admin = createAdminClient()
  const { data: title } = await admin
    .from('Titles')
    .select('slug, book_photos_blurs')
    .eq('id', titleId)
    .maybeSingle()
  const slug = title?.slug
  if (!slug) return { status: 'error', message: 'У книги нет slug.' }

  const { error: removeError } = await admin.storage.from(BOOK_PHOTOS_BUCKET).remove([`${slug}/${folder}/${name}`])
  if (removeError) return { status: 'error', message: removeError.message }

  const blurs = asStringMap(title?.book_photos_blurs)
  delete blurs[`${folder}/${name}`]
  await admin.from('Titles').update({ book_photos_blurs: blurs as unknown as Json }).eq('id', titleId)

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath(`/books/${slug}`)
  return { status: 'ok', photos: await getAdminBookPhotos(slug) }
}

// ─── Title lifecycle + products ─────────────────────────────────────────────

// Next id for a table whose sequence may be stale from seeded explicit-id
// inserts — compute max(id)+1 explicitly to avoid PK collisions.
async function nextId(
  admin: ReturnType<typeof createAdminClient>,
  table: string
): Promise<number> {
  const builder = admin.from(table as 'Titles') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await builder.select('id').order('id', { ascending: false }).limit(1)
  return (res.data?.[0]?.id ?? 0) + 1
}

const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
  slug: z
    .string()
    .trim()
    .min(1, 'Введите slug')
    .regex(/^[a-z0-9-]+$/, 'Slug: только латиница, цифры и дефис'),
})

// Create a new Title as a draft (hidden from the storefront until published).
// Redirects to its editor so products can be added.
export async function createBookAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name'), slug: formData.get('slug') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'Titles')
  const { error } = await admin
    .from('Titles')
    .insert({ id, name: parsed.data.name, slug: parsed.data.slug, status: 'draft', is_compilation: false })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Книга с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }

  await logAdminAction({
    actorUserId: user.id,
    action: 'book.create',
    entityType: 'book',
    entityId: String(id),
    summary: `Создана книга «${parsed.data.name}» (черновик)`,
  })
  revalidatePath('/admin/books')
  redirect(`/admin/books/${id}`)
}

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['draft', 'published', 'archived']),
})

// Publish / archive / unpublish a title.
export async function setBookStatusAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  const user = await requireAdmin()
  const parsed = statusSchema.safeParse({ id: formData.get('id'), status: formData.get('status') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: title } = await admin.from('Titles').select('slug').eq('id', parsed.data.id).maybeSingle()
  const { error } = await admin.from('Titles').update({ status: parsed.data.status }).eq('id', parsed.data.id)
  if (error) return { status: 'error', message: error.message }

  const labels: Record<string, string> = { draft: 'черновик', published: 'опубликована', archived: 'в архиве' }
  await logAdminAction({
    actorUserId: user.id,
    action: 'book.status',
    entityType: 'book',
    entityId: String(parsed.data.id),
    summary: `Статус книги: ${labels[parsed.data.status]}`,
  })
  revalidatePath(`/admin/books/${parsed.data.id}`)
  revalidatePath('/admin/books')
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

// Hard-delete a title and everything cascading from it (products, links,
// photos-blurs column), plus its storage objects. Allowed only for draft or
// archived titles — publish must be archived first.
export async function deleteBookAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: title } = await admin.from('Titles').select('status, slug, cover, name').eq('id', id).maybeSingle()
  if (!title) return { status: 'error', message: 'Книга не найдена.' }
  if (title.status === 'published') {
    return { status: 'error', message: 'Сначала переведите книгу в архив или черновик.' }
  }

  // Storage cleanup (best effort).
  if (title.cover) await admin.storage.from('covers').remove([title.cover]).catch(() => {})
  if (title.slug) {
    // Photos live in per-edition subfolders (print/card/digital) — collect each.
    const photoPaths: string[] = []
    for (const folder of BOOK_PHOTO_FOLDERS) {
      const { data: photos } = await admin.storage
        .from(BOOK_PHOTOS_BUCKET)
        .list(`${title.slug}/${folder}`)
      for (const f of photos ?? []) {
        if (f.name) photoPaths.push(`${title.slug}/${folder}/${f.name}`)
      }
    }
    if (photoPaths.length > 0) await admin.storage.from(BOOK_PHOTOS_BUCKET).remove(photoPaths).catch(() => {})
    // Trailer assets (Booktrailers row cascade-deletes with the Title).
    await admin.storage
      .from(BOOKTRAILERS_BUCKET)
      .remove([`${title.slug}/video.mp4`, `${title.slug}/video.webm`, `${title.slug}/poster.jpg`])
      .catch(() => {})
  }
  // Digital files of each edition (editions themselves cascade-delete with the Title).
  const digitalPaths: string[] = []
  for (const [t] of Object.entries(EDITION_FILE_FOLDER)) {
    const { data } = await admin.from(t as 'Ebooks').select('file_path').eq('title_id', id)
    for (const r of (data ?? []) as Array<{ file_path: string | null }>) {
      if (r.file_path) digitalPaths.push(r.file_path)
    }
  }
  if (digitalPaths.length > 0) await admin.storage.from(DIGITAL_FILES_BUCKET).remove(digitalPaths).catch(() => {})

  const { error } = await admin.from('Titles').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'book.delete',
    entityType: 'book',
    entityId: String(id),
    summary: `Удалена книга «${title.name}»`,
  })
  revalidatePath('/admin/books')
  redirect('/admin/books')
}

function asEditionTable(v: FormDataEntryValue | null): EditionTable | null {
  return EDITION_TABLES.includes(v as EditionTable) ? (v as EditionTable) : null
}

// Add a product (edition) of a given type to a title. One per type (UNIQUE
// title_id), created unpublished with no price.
export async function addProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const table = asEditionTable(formData.get('table'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }

  const admin = createAdminClient()
  const id = await nextId(admin, table)
  const row: Record<string, unknown> = { id, title_id: titleId, price: null, is_published: false }
  if (HAS_SOLD_OUT.has(table)) row.sold_out = false
  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.insert(row)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Такой продукт уже есть у книги.' : error.message
    return { status: 'error', message: msg }
  }
  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

// Remove a product (edition) from a title. Past orders keep their snapshots.
export async function removeProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }

  const admin = createAdminClient()
  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.delete().eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

// Save one product's price / discount / published / sold_out.
export async function updateProductAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }

  const payload: EditionUpdate = {
    price: numOrNull(formData.get('price')),
    discount: numOrNull(formData.get('discount')),
    is_published: formData.get('isPublished') === 'on',
  }
  if (HAS_SOLD_OUT.has(table)) payload.sold_out = formData.get('soldOut') === 'on'

  const admin = createAdminClient()
  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.update(payload).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

// ─── Digital files (private digital-files bucket) ───────────────────────────

const DIGITAL_FILES_BUCKET = 'digital-files'
const MAX_DIGITAL_BYTES = 1024 * 1024 * 1024 // 1 GB

// Upload a product's downloadable file to digital-files/{folder}/{id}.{ext}
// and set its file_path. Only e-book / audiobook / card-book have files.
export async function uploadProductFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  const file = formData.get('file')
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }
  const folder = EDITION_FILE_FOLDER[table]
  if (!folder) return { status: 'error', message: 'У этого типа продукта нет файла.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  if (file.size > MAX_DIGITAL_BYTES) return { status: 'error', message: 'Файл больше 1 ГБ.' }
  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'

  const admin = createAdminClient()
  const key = `${folder}/${editionId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(DIGITAL_FILES_BUCKET)
    .upload(key, buffer, { contentType: file.type || 'application/octet-stream', upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.update({ file_path: key } as unknown as EditionUpdate).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

// Clear a product's file (remove the object + null the file_path).
export async function removeProductFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  const filePath = (formData.get('filePath') as string | null)?.trim()
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }

  const admin = createAdminClient()
  if (filePath) await admin.storage.from(DIGITAL_FILES_BUCKET).remove([filePath]).catch(() => {})
  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.update({ file_path: null } as unknown as EditionUpdate).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

// ─── Demo files (public demos bucket) ──────────────────────────────────────

const DEMOS_BUCKET = 'demos'
const MAX_DEMO_BYTES = 50 * 1024 * 1024

// Upload a demo file for an edition to the public `demos` bucket.
// Only Ebooks / Audiobooks / CardBooks have demos.
export async function uploadDemoFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  const file = formData.get('file')
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }
  if (!EDITION_HAS_DEMO[table]) return { status: 'error', message: 'У этого типа продукта нет демо.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  if (file.size > MAX_DEMO_BYTES) return { status: 'error', message: 'Файл больше 50 МБ.' }

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
  const admin = createAdminClient()
  const key = `${EDITION_FILE_FOLDER[table]}/demo-${editionId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(DEMOS_BUCKET)
    .upload(key, buffer, { contentType: file.type || 'application/octet-stream', upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.update({ demo_path: key } as unknown as EditionUpdate).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

// Remove a demo file from storage + clear the demo_path column.
export async function removeDemoFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const table = asEditionTable(formData.get('table'))
  const demoPath = (formData.get('demoPath') as string | null)?.trim()
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }

  const admin = createAdminClient()
  if (demoPath) await admin.storage.from(DEMOS_BUCKET).remove([demoPath]).catch(() => {})
  const writer = admin.from(table) as unknown as EditionWriter
  const { error } = await writer.update({ demo_path: null } as unknown as EditionUpdate).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

// ─── Awards (Titles_Awards link) ────────────────────────────────────────────

async function revalidateBookBySlug(admin: ReturnType<typeof createAdminClient>, titleId: number) {
  const { data } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (data?.slug) revalidatePath(`/books/${data.slug}`)
}

export async function addAwardAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const awardId = Number(formData.get('awardId'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!Number.isInteger(awardId) || awardId <= 0) return { status: 'error', message: 'Выберите награду.' }

  const admin = createAdminClient()
  const { count } = await admin
    .from('Titles_Awards')
    .select('id', { count: 'exact', head: true })
    .eq('title_id', titleId)
  const id = await nextId(admin, 'Titles_Awards')
  const { error } = await admin
    .from('Titles_Awards')
    .insert({ id, title_id: titleId, award_id: awardId, position: count ?? 0 })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Награда уже добавлена.' : error.message
    return { status: 'error', message: msg }
  }
  await revalidateBookBySlug(admin, titleId)
  return { status: 'ok' }
}

export async function removeAwardAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const awardId = Number(formData.get('awardId'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!Number.isInteger(awardId) || awardId <= 0) return { status: 'error', message: 'Неверная награда.' }

  const admin = createAdminClient()
  const { error } = await admin.from('Titles_Awards').delete().eq('title_id', titleId).eq('award_id', awardId)
  if (error) return { status: 'error', message: error.message }
  await revalidateBookBySlug(admin, titleId)
  return { status: 'ok' }
}

// ─── Per-edition contributors (workers) ─────────────────────────────────────

// Loose, bound write handle for an arbitrary table (dynamic name).
type LooseWriter = {
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  delete: () => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
}

const workerSchema = z.object({
  titleId: z.coerce.number().int().positive(),
  editionId: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите имя'),
  job: z.string().trim().min(1, 'Введите роль'),
})

// Add a contributor to one edition: create a Workers row (book contributor,
// not a team member) + the join row.
export async function addWorkerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const table = asEditionTable(formData.get('table'))
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }
  const parsed = workerSchema.safeParse({
    titleId: formData.get('titleId'),
    editionId: formData.get('editionId'),
    name: formData.get('name'),
    job: formData.get('job'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const { titleId, editionId, name, job } = parsed.data

  const admin = createAdminClient()
  const workerId = await nextId(admin, 'Workers')
  const workersWriter = admin.from('Workers') as unknown as LooseWriter
  const { error: workerError } = await workersWriter.insert({
    id: workerId,
    name,
    job,
    is_team_member: false,
    sort_order: 0,
  })
  if (workerError) return { status: 'error', message: workerError.message }

  const joinTable = EDITION_WORKERS_TABLE[table]
  const fk = EDITION_WORKERS_FK[table]
  const { count } = await admin
    .from(joinTable as 'EbookWorkers')
    .select('id', { count: 'exact', head: true })
    .eq(fk, editionId)
  const linkId = await nextId(admin, joinTable)
  const joinWriter = admin.from(joinTable as 'EbookWorkers') as unknown as LooseWriter
  const { error: linkError } = await joinWriter.insert({
    id: linkId,
    [fk]: editionId,
    worker_id: workerId,
    sort_order: count ?? 0,
  })
  if (linkError) return { status: 'error', message: linkError.message }

  await revalidateBookBySlug(admin, titleId)
  return { status: 'ok' }
}

// Remove a contributor from an edition: drop the join row + the Workers row
// (only if it's a book contributor, never a team member).
export async function removeWorkerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const linkId = Number(formData.get('linkId'))
  const workerId = Number(formData.get('workerId'))
  const table = asEditionTable(formData.get('table'))
  if (!table) return { status: 'error', message: 'Неверный тип продукта.' }
  if (!Number.isInteger(linkId) || linkId <= 0) return { status: 'error', message: 'Неверная связь.' }

  const admin = createAdminClient()
  const joinTable = EDITION_WORKERS_TABLE[table]
  const joinWriter = admin.from(joinTable as 'EbookWorkers') as unknown as LooseWriter
  const { error } = await joinWriter.delete().eq('id', linkId)
  if (error) return { status: 'error', message: error.message }

  if (Number.isInteger(workerId) && workerId > 0) {
    const { data: worker } = await admin.from('Workers').select('is_team_member').eq('id', workerId).maybeSingle()
    if (worker && worker.is_team_member === false) {
      const workersWriter = admin.from('Workers') as unknown as LooseWriter
      await workersWriter.delete().eq('id', workerId)
    }
  }

  await revalidateBookBySlug(admin, titleId)
  return { status: 'ok' }
}

// ─── Booktrailer (public booktrailers bucket) ───────────────────────────────

const BOOKTRAILERS_BUCKET = 'booktrailers'
const TRAILER_FILE: Record<string, { name: string; type: string }> = {
  mp4: { name: 'video.mp4', type: 'video/mp4' },
  webm: { name: 'video.webm', type: 'video/webm' },
  poster: { name: 'poster.jpg', type: 'image/jpeg' },
}

// Upload one trailer asset (mp4 / webm / poster) to booktrailers/{slug}/ and
// ensure a Booktrailers row exists. Uploading a poster sets has_poster.
export async function uploadTrailerFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const kind = formData.get('kind') as string | null
  const file = formData.get('file')
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!kind || !TRAILER_FILE[kind]) return { status: 'error', message: 'Неверный тип файла.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  if (file.size > MAX_DIGITAL_BYTES) return { status: 'error', message: 'Файл больше 1 ГБ.' }

  const admin = createAdminClient()
  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  if (!title?.slug) return { status: 'error', message: 'Сначала задайте slug книги.' }

  const spec = TRAILER_FILE[kind]
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(BOOKTRAILERS_BUCKET)
    .upload(`${title.slug}/${spec.name}`, buffer, { contentType: file.type || spec.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  // Ensure a Booktrailers row, and set has_poster when uploading a poster.
  const { data: existing } = await admin.from('Booktrailers').select('id').eq('title_id', titleId).maybeSingle()
  if (existing) {
    if (kind === 'poster') await admin.from('Booktrailers').update({ has_poster: true }).eq('id', existing.id)
  } else {
    const id = await nextId(admin, 'Booktrailers')
    const writer = admin.from('Booktrailers') as unknown as LooseWriter
    const { error } = await writer.insert({ id, title_id: titleId, has_poster: kind === 'poster' })
    if (error) return { status: 'error', message: error.message }
  }

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

// Remove the whole trailer: delete the three files + the Booktrailers row.
export async function removeTrailerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }

  const admin = createAdminClient()
  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  if (title?.slug) {
    const paths = Object.values(TRAILER_FILE).map((f) => `${title.slug}/${f.name}`)
    await admin.storage.from(BOOKTRAILERS_BUCKET).remove(paths).catch(() => {})
  }
  const { error } = await admin.from('Booktrailers').delete().eq('title_id', titleId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}
