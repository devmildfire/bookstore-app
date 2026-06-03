'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'

export type AdminActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

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
  isFeatured: z.boolean(),
})

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = (v as string | null)?.trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

type EditionUpdate = { price: number | null; discount: number | null; is_published: boolean; sold_out?: boolean }

// Save core Title fields + per-edition pricing in one submit.
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
    isFeatured: formData.get('isFeatured') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

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
      is_featured: d.isFeatured,
    })
    .eq('id', d.id)
  if (titleError) return { status: 'error', message: titleError.message }

  // Editions: the form sends a JSON list of {table,id}; read each one's fields.
  // NB: call admin.from(table) directly (bound) — detaching `from` breaks its
  // internal `this`. The select string is dynamic, so cast the builder.
  type EditionWriter = {
    update: (v: EditionUpdate) => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
  }
  let editionKeys: Array<{ table: string; id: number }> = []
  try {
    editionKeys = JSON.parse((formData.get('editionKeys') as string) || '[]')
  } catch {
    editionKeys = []
  }
  for (const key of editionKeys) {
    if (!EDITION_TABLES.includes(key.table as EditionTable)) continue
    const table = key.table as EditionTable
    const prefix = `ed_${table}_${key.id}_`
    const payload: EditionUpdate = {
      price: numOrNull(formData.get(`${prefix}price`)),
      discount: numOrNull(formData.get(`${prefix}discount`)),
      is_published: formData.get(`${prefix}isPublished`) === 'on',
    }
    if (HAS_SOLD_OUT.has(table)) payload.sold_out = formData.get(`${prefix}soldOut`) === 'on'
    const writer = admin.from(table) as unknown as EditionWriter
    const { error } = await writer.update(payload).eq('id', key.id)
    if (error) return { status: 'error', message: `${table}: ${error.message}` }
  }

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
