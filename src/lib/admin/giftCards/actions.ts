'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'
import { getGiftCardImageUrl } from '@/lib/storage'

export type GiftCardActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const GIFT_CARDS_BUCKET = 'gift-cards'
const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

async function nextId(admin: ReturnType<typeof createAdminClient>, table: string): Promise<number> {
  const b = admin.from(table as 'GiftCardProducts') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await b.select('id').order('id', { ascending: false }).limit(1)
  return (res.data?.[0]?.id ?? 0) + 1
}

const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug').regex(/^[a-z0-9-]+$/, 'Slug: латиница, цифры, дефис'),
  faceValue: z.coerce.number().int().min(1, 'Номинал должен быть больше 0'),
})

export async function createGiftCardAction(_prev: GiftCardActionResult | null, formData: FormData): Promise<GiftCardActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    faceValue: formData.get('faceValue'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'GiftCardProducts')
  const { error } = await admin
    .from('GiftCardProducts')
    .insert({ id, name: parsed.data.name, slug: parsed.data.slug, face_value: parsed.data.faceValue, sort_order: id })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Карта с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  await logAdminAction({
    actorUserId: user.id,
    action: 'giftcard.create',
    entityType: 'giftcard',
    entityId: String(id),
    summary: `Создана карта даров «${parsed.data.name}»`,
  })
  revalidatePath('/admin/gift-cards')
  redirect(`/admin/gift-cards/${id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug'),
  faceValue: z.coerce.number().int().min(1),
  sortOrder: z.coerce.number().int().min(0),
})

export async function updateGiftCardAction(_prev: GiftCardActionResult | null, formData: FormData): Promise<GiftCardActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    faceValue: formData.get('faceValue'),
    sortOrder: formData.get('sortOrder'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('GiftCardProducts')
    .update({ name: d.name, slug: d.slug, face_value: d.faceValue, sort_order: d.sortOrder })
    .eq('id', d.id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/gift-cards/${d.id}`)
  revalidatePath('/admin/gift-cards')
  return { status: 'ok' }
}

export async function deleteGiftCardAction(_prev: GiftCardActionResult | null, formData: FormData): Promise<GiftCardActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { count } = await admin.from('GiftCards').select('id', { count: 'exact', head: true }).eq('product_id', id)
  if ((count ?? 0) > 0) {
    return { status: 'error', message: `Выпущено ${count} карт этого номинала — удалить нельзя.` }
  }
  const { data: gc } = await admin.from('GiftCardProducts').select('name, image_path').eq('id', id).maybeSingle()
  if (gc?.image_path) await admin.storage.from(GIFT_CARDS_BUCKET).remove([gc.image_path]).catch(() => {})
  const { error } = await admin.from('GiftCardProducts').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'giftcard.delete',
    entityType: 'giftcard',
    entityId: String(id),
    summary: `Удалена карта даров «${gc?.name ?? id}»`,
  })
  revalidatePath('/admin/gift-cards')
  redirect('/admin/gift-cards')
}

export async function uploadGiftCardImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('giftCardId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_IMAGE_BYTES) return { status: 'error', message: 'Файл больше 10 МБ.' }

  const admin = createAdminClient()
  const filename = `giftcard-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(GIFT_CARDS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }
  const { error } = await admin.from('GiftCardProducts').update({ image_path: filename }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/gift-cards/${id}`)
  revalidatePath('/admin/gift-cards')
  return { status: 'ok', url: `${getGiftCardImageUrl(filename)}?v=${Date.now()}` }
}
