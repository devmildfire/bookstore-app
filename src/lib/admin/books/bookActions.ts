'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl, BOOK_PHOTOS_BUCKET } from '@/lib/storage'
import { getAdminBookPhotos } from '@/api/admin/books'
import { isBookPhotoFolder, BOOK_PHOTO_FOLDERS } from '@/consts/bookPhotos'
import {
  type AdminActionResult,
  type UploadResult,
  type PhotosResult,
  type LooseWriter,
  coreSchema,
  createSchema,
  statusSchema,
  MIME_EXT,
  MAX_COVER_BYTES,
  MAX_PHOTO_BYTES,
  DIGITAL_FILES_BUCKET,
  BOOKTRAILERS_BUCKET,
  numOrNull,
  asStringMap,
  nextPhotoIndex,
  nextId,
} from './shared'

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
  await admin.from('Titles').update({ book_photos_blurs: blurs }).eq('id', titleId)

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath(`/books/${slug}`)
  return { status: 'ok', photos: await getAdminBookPhotos(slug) }
}

export async function deleteBookPhotoAction(formData: FormData): Promise<PhotosResult> {
  await requireAdmin()

  const titleId = Number(formData.get('titleId'))
  const name = (formData.get('name') as string | null)?.trim()
  const folder = formData.get('folder')
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!isBookPhotoFolder(folder)) return { status: 'error', message: 'Неверный раздел фото.' }
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
  await admin.from('Titles').update({ book_photos_blurs: blurs }).eq('id', titleId)

  revalidatePath(`/admin/books/${titleId}`)
  revalidatePath(`/books/${slug}`)
  return { status: 'ok', photos: await getAdminBookPhotos(slug) }
}

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

  if (title.cover) await admin.storage.from('covers').remove([title.cover]).catch(() => {})
  if (title.slug) {
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
    await admin.storage
      .from(BOOKTRAILERS_BUCKET)
      .remove([`${title.slug}/video.mp4`, `${title.slug}/video.webm`, `${title.slug}/poster.jpg`])
      .catch(() => {})
  }
  const digitalPaths: string[] = []
  {
    const { data } = await admin.from('Editions').select('file_path').eq('title_id', id)
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
