'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'
import { getPartnerLogoUrl, PARTNERS_BUCKET } from '@/lib/storage'

export type PartnerActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const IMAGE_EXT: Record<string, string> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const urlField = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .nullable()
  .refine((v) => v == null || /^https?:\/\//.test(v), 'Ссылка должна начинаться с http:// или https://')

const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
})

export async function createPartnerAction(
  _prev: PartnerActionResult | null,
  formData: FormData
): Promise<PartnerActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: last } = await admin
    .from('Partners')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = (last?.sort_order ?? -1) + 1

  const { data, error } = await admin
    .from('Partners')
    .insert({ name: parsed.data.name, sort_order: sortOrder })
    .select('id')
    .single()
  if (error || !data) {
    const msg = error?.message.includes('duplicate')
      ? 'Партнёр с таким названием уже существует.'
      : (error?.message ?? 'Не удалось создать партнёра.')
    return { status: 'error', message: msg }
  }

  await logAdminAction({
    actorUserId: user.id,
    action: 'partner.create',
    entityType: 'partner',
    entityId: String(data.id),
    summary: `Создан партнёр «${parsed.data.name}»`,
  })
  revalidatePath('/admin/partners')
  revalidatePath('/about')
  redirect(`/admin/partners/${data.id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  websiteUrl: urlField,
  position: z.coerce.number().int().min(0),
})

export async function updatePartnerAction(
  _prev: PartnerActionResult | null,
  formData: FormData
): Promise<PartnerActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    websiteUrl: formData.get('websiteUrl'),
    position: formData.get('position'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('Partners')
    .update({ name: d.name, website_url: d.websiteUrl, sort_order: d.position })
    .eq('id', d.id)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Партнёр с таким названием уже существует.' : error.message
    return { status: 'error', message: msg }
  }

  revalidatePath(`/admin/partners/${d.id}`)
  revalidatePath('/admin/partners')
  revalidatePath('/about')
  return { status: 'ok' }
}

export async function deletePartnerAction(
  _prev: PartnerActionResult | null,
  formData: FormData
): Promise<PartnerActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: partner } = await admin.from('Partners').select('name').eq('id', id).maybeSingle()
  const { error } = await admin.from('Partners').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'partner.delete',
    entityType: 'partner',
    entityId: String(id),
    summary: `Удалён партнёр «${partner?.name ?? id}»`,
  })
  revalidatePath('/admin/partners')
  revalidatePath('/about')
  redirect('/admin/partners')
}

// Upload a partner logo tile (SVG/PNG/JPG/WEBP) to the partners bucket and store
// its bare filename on the partner. The tile renders edge-to-edge on the About page.
export async function uploadPartnerLogoAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('partnerId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = IMAGE_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только SVG, PNG, JPEG или WEBP.' }
  if (file.size > 5 * 1024 * 1024) return { status: 'error', message: 'Файл больше 5 МБ.' }

  const admin = createAdminClient()
  const filename = `partner-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(PARTNERS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const { error } = await admin.from('Partners').update({ logo_path: filename }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/partners/${id}`)
  revalidatePath('/admin/partners')
  revalidatePath('/about')
  return { status: 'ok', url: `${getPartnerLogoUrl(filename)}?v=${Date.now()}` }
}
