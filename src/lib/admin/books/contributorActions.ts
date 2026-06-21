'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/server'
import {
  type AdminActionResult,
  type LooseWriter,
  workerSchema,
  MAX_DIGITAL_BYTES,
  BOOKTRAILERS_BUCKET,
  TRAILER_FILE,
  asEditionKind,
  nextId,
  revalidateBookBySlug,
} from './shared'

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

export async function addWorkerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
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

  const { count } = await admin
    .from('EditionWorkers')
    .select('id', { count: 'exact', head: true })
    .eq('edition_id', editionId)
  const { error: linkError } = await admin.from('EditionWorkers').insert({
    edition_id: editionId,
    worker_id: workerId,
    sort_order: count ?? 0,
  })
  if (linkError) return { status: 'error', message: linkError.message }

  await revalidateBookBySlug(admin, titleId)
  return { status: 'ok' }
}

export async function removeWorkerAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const linkId = Number(formData.get('linkId'))
  const workerId = Number(formData.get('workerId'))
  if (!Number.isInteger(linkId) || linkId <= 0) return { status: 'error', message: 'Неверная связь.' }

  const admin = createAdminClient()
  const { error } = await admin.from('EditionWorkers').delete().eq('id', linkId)
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
