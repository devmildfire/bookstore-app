'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'
import { getAwardUrl, AWARDS_BUCKET } from '@/lib/storage'

export type AwardActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const IMAGE_EXT: Record<string, string> = {
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const createSchema = z.object({
  title: z.string().trim().min(1, 'Введите название'),
  slug: z
    .string()
    .trim()
    .min(1, 'Введите slug')
    .regex(/^[a-z0-9-]+$/, 'Slug: только латиница, цифры и дефис'),
})

export async function createAwardAction(
  _prev: AwardActionResult | null,
  formData: FormData
): Promise<AwardActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ title: formData.get('title'), slug: formData.get('slug') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: last } = await admin
    .from('Awards')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const position = (last?.position ?? 0) + 1

  const { data, error } = await admin
    .from('Awards')
    .insert({ slug: parsed.data.slug, title: parsed.data.title, position, is_active: true })
    .select('id')
    .single()
  if (error || !data) {
    const msg = error?.message.includes('duplicate')
      ? 'Награда с таким slug уже существует.'
      : (error?.message ?? 'Не удалось создать награду.')
    return { status: 'error', message: msg }
  }

  await logAdminAction({
    actorUserId: user.id,
    action: 'award.create',
    entityType: 'award',
    entityId: String(data.id),
    summary: `Создана награда «${parsed.data.title}»`,
  })
  revalidatePath('/admin/awards')
  redirect(`/admin/awards/${data.id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, 'Введите название'),
  slug: z
    .string()
    .trim()
    .min(1, 'Введите slug')
    .regex(/^[a-z0-9-]+$/, 'Slug: только латиница, цифры и дефис'),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
})

export async function updateAwardAction(
  _prev: AwardActionResult | null,
  formData: FormData
): Promise<AwardActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    slug: formData.get('slug'),
    position: formData.get('position'),
    isActive: formData.get('isActive') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('Awards')
    .update({ title: d.title, slug: d.slug, position: d.position, is_active: d.isActive })
    .eq('id', d.id)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Награда с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }

  revalidatePath(`/admin/awards/${d.id}`)
  revalidatePath('/admin/awards')
  return { status: 'ok' }
}

export async function deleteAwardAction(
  _prev: AwardActionResult | null,
  formData: FormData
): Promise<AwardActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: award } = await admin.from('Awards').select('title').eq('id', id).maybeSingle()
  // Titles_Awards.award_id is ON DELETE CASCADE, so book links are removed too.
  const { error } = await admin.from('Awards').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'award.delete',
    entityType: 'award',
    entityId: String(id),
    summary: `Удалена награда «${award?.title ?? id}»`,
  })
  revalidatePath('/admin/awards')
  redirect('/admin/awards')
}

// Upload an award badge (SVG/PNG/JPG/WEBP) to the awards bucket and store its
// bare filename on the award. SVGs render via <Image unoptimized> on the storefront.
export async function uploadAwardImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('awardId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = IMAGE_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только SVG, PNG, JPEG или WEBP.' }
  if (file.size > 5 * 1024 * 1024) return { status: 'error', message: 'Файл больше 5 МБ.' }

  const admin = createAdminClient()
  const filename = `award-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(AWARDS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  const { error } = await admin.from('Awards').update({ image: filename }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/awards/${id}`)
  revalidatePath('/admin/awards')
  return { status: 'ok', url: `${getAwardUrl(filename)}?v=${Date.now()}` }
}
