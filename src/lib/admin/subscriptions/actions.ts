'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { makeBlurDataUrl } from '@/lib/admin/blur'
import { createAdminClient } from '@/lib/supabase/server'
import { getSubscriptionImageUrl } from '@/lib/storage'

export type SubscriptionActionResult = { status: 'ok' } | { status: 'error'; message: string }
export type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

const SUBSCRIPTIONS_BUCKET = 'subscriptions'
const MIME_EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

async function nextId(admin: ReturnType<typeof createAdminClient>, table: string): Promise<number> {
  const b = admin.from(table as 'Subscriptions') as unknown as {
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
  price: z.coerce.number().int().min(0),
})

export async function createSubscriptionAction(_prev: SubscriptionActionResult | null, formData: FormData): Promise<SubscriptionActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    price: formData.get('price'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'Subscriptions')
  const { error } = await admin.from('Subscriptions').insert({
    id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    price: parsed.data.price,
    perks: [],
    position: id,
    is_active: true,
    is_published: false,
  })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Подписка с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  await logAdminAction({
    actorUserId: user.id,
    action: 'subscription.create',
    entityType: 'subscription',
    entityId: String(id),
    summary: `Создана подписка «${parsed.data.name}»`,
  })
  revalidatePath('/admin/subscriptions')
  redirect(`/admin/subscriptions/${id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug'),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0),
  discount: z.coerce.number().int().min(0).max(100).optional(),
  perks: z.string().optional(),
  isPublished: z.boolean(),
  isActive: z.boolean(),
})

export async function updateSubscriptionAction(_prev: SubscriptionActionResult | null, formData: FormData): Promise<SubscriptionActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price'),
    discount: (formData.get('discount') as string) || undefined,
    perks: (formData.get('perks') as string) || undefined,
    isPublished: formData.get('isPublished') === 'on',
    isActive: formData.get('isActive') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data
  // perks: one per line.
  const perks = (d.perks ?? '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)

  const admin = createAdminClient()
  const { error } = await admin
    .from('Subscriptions')
    .update({
      name: d.name,
      slug: d.slug,
      description: d.description ?? null,
      price: d.price,
      discount: d.discount ?? null,
      perks,
      is_published: d.isPublished,
      is_active: d.isActive,
    })
    .eq('id', d.id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/subscriptions/${d.id}`)
  revalidatePath('/admin/subscriptions')
  revalidatePath('/subscription')
  return { status: 'ok' }
}

export async function deleteSubscriptionAction(_prev: SubscriptionActionResult | null, formData: FormData): Promise<SubscriptionActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { count } = await admin
    .from('UserSubscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('subscription_id', id)
  if ((count ?? 0) > 0) {
    return { status: 'error', message: `У плана ${count} подписчиков — удалить нельзя.` }
  }
  const { data: sub } = await admin.from('Subscriptions').select('name, image').eq('id', id).maybeSingle()
  if (sub?.image) await admin.storage.from(SUBSCRIPTIONS_BUCKET).remove([sub.image]).catch(() => {})
  const { error } = await admin.from('Subscriptions').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'subscription.delete',
    entityType: 'subscription',
    entityId: String(id),
    summary: `Удалена подписка «${sub?.name ?? id}»`,
  })
  revalidatePath('/admin/subscriptions')
  redirect('/admin/subscriptions')
}

export async function uploadSubscriptionImageAction(formData: FormData): Promise<UploadResult> {
  await requireAdmin()
  const id = Number(formData.get('subscriptionId'))
  const file = formData.get('file')
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Файл не выбран.' }
  const ext = MIME_EXT[file.type]
  if (!ext) return { status: 'error', message: 'Только JPEG, PNG или WEBP.' }
  if (file.size > MAX_IMAGE_BYTES) return { status: 'error', message: 'Файл больше 10 МБ.' }

  const admin = createAdminClient()
  const filename = `subscription-${id}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await admin.storage
    .from(SUBSCRIPTIONS_BUCKET)
    .upload(filename, buffer, { contentType: file.type, upsert: true })
  if (uploadError) return { status: 'error', message: uploadError.message }

  let blur: string | null = null
  try {
    blur = await makeBlurDataUrl(buffer)
  } catch {
    blur = null
  }
  const { error } = await admin.from('Subscriptions').update({ image: filename, image_blur: blur }).eq('id', id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/subscriptions/${id}`)
  revalidatePath('/admin/subscriptions')
  return { status: 'ok', url: `${getSubscriptionImageUrl(filename)}?v=${Date.now()}` }
}
