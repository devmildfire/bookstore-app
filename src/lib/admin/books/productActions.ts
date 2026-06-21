'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { EDITION_FILE_FOLDER, EDITION_HAS_DEMO, EDITION_HAS_SOLD_OUT } from '@/lib/admin/bookProducts'
import {
  type AdminActionResult,
  asEditionKind,
  numOrNull,
  MAX_DIGITAL_BYTES,
  MAX_DEMO_BYTES,
  DIGITAL_FILES_BUCKET,
  DEMOS_BUCKET,
} from './shared'

export async function addProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const kind = asEditionKind(formData.get('kind'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Неверный id книги.' }
  if (!kind) return { status: 'error', message: 'Неверный тип продукта.' }

  const admin = createAdminClient()
  const { error } = await admin.from('Editions').insert({ title_id: titleId, kind, price: null, is_published: false })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Такой продукт уже есть у книги.' : error.message
    return { status: 'error', message: msg }
  }
  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

export async function removeProductAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }

  const admin = createAdminClient()
  const { error } = await admin.from('Editions').delete().eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

export async function updateProductAction(_prev: AdminActionResult | null, formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const kind = asEditionKind(formData.get('kind'))
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!kind) return { status: 'error', message: 'Неверный тип продукта.' }

  const payload: { price: number | null; discount: number | null; is_published: boolean; sold_out?: boolean } = {
    price: numOrNull(formData.get('price')),
    discount: numOrNull(formData.get('discount')),
    is_published: formData.get('isPublished') === 'on',
  }
  if (EDITION_HAS_SOLD_OUT[kind]) payload.sold_out = formData.get('soldOut') === 'on'

  const admin = createAdminClient()
  const { error } = await admin.from('Editions').update(payload).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  const { data: title } = await admin.from('Titles').select('slug').eq('id', titleId).maybeSingle()
  revalidatePath(`/admin/books/${titleId}`)
  if (title?.slug) revalidatePath(`/books/${title.slug}`)
  return { status: 'ok' }
}

export async function uploadProductFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const kind = asEditionKind(formData.get('kind'))
  const file = formData.get('file')
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!kind) return { status: 'error', message: 'Неверный тип продукта.' }
  const folder = EDITION_FILE_FOLDER[kind]
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

  const { error } = await admin.from('Editions').update({ file_path: key }).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

export async function removeProductFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const filePath = (formData.get('filePath') as string | null)?.trim()
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }

  const admin = createAdminClient()
  if (filePath) await admin.storage.from(DIGITAL_FILES_BUCKET).remove([filePath]).catch(() => {})
  const { error } = await admin.from('Editions').update({ file_path: null }).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

export async function uploadDemoFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const kind = asEditionKind(formData.get('kind'))
  const file = formData.get('file')
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }
  if (!kind) return { status: 'error', message: 'Неверный тип продукта.' }
  if (!EDITION_HAS_DEMO[kind]) return { status: 'error', message: 'У этого типа продукта нет демо.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  if (file.size > MAX_DEMO_BYTES) return { status: 'error', message: 'Файл больше 50 МБ.' }

  const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'bin'
  const admin = createAdminClient()
  const key = `${EDITION_FILE_FOLDER[kind]}/demo-${editionId}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(DEMOS_BUCKET)
    .upload(key, buffer, { contentType: file.type || 'application/octet-stream', upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const { error } = await admin.from('Editions').update({ demo_path: key }).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}

export async function removeDemoFileAction(formData: FormData): Promise<AdminActionResult> {
  await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  const editionId = Number(formData.get('editionId'))
  const demoPath = (formData.get('demoPath') as string | null)?.trim()
  if (!Number.isInteger(editionId) || editionId <= 0) return { status: 'error', message: 'Неверный id продукта.' }

  const admin = createAdminClient()
  if (demoPath) await admin.storage.from(DEMOS_BUCKET).remove([demoPath]).catch(() => {})
  const { error } = await admin.from('Editions').update({ demo_path: null }).eq('id', editionId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/books/${titleId}`)
  return { status: 'ok' }
}
