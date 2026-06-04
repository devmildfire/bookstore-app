'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'

export type BoxSetActionResult = { status: 'ok' } | { status: 'error'; message: string }

type LooseWriter = {
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  delete: () => { eq: (col: string, val: number) => Promise<{ error: { message: string } | null }> }
}

async function nextId(admin: ReturnType<typeof createAdminClient>, table: string): Promise<number> {
  const b = admin.from(table as 'BoxSets') as unknown as {
    select: (c: string) => {
      order: (c: string, o: { ascending: boolean }) => { limit: (n: number) => Promise<{ data: Array<{ id: number }> | null }> }
    }
  }
  const res = await b.select('id').order('id', { ascending: false }).limit(1)
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

export async function createBoxSetAction(_prev: BoxSetActionResult | null, formData: FormData): Promise<BoxSetActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name'), slug: formData.get('slug') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const id = await nextId(admin, 'BoxSets')
  const { error } = await admin.from('BoxSets').insert({
    id,
    name: parsed.data.name,
    slug: parsed.data.slug,
    price: 0,
    position: id,
    is_active: true,
    is_published: false,
  })
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Бокс-сет с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  await logAdminAction({
    actorUserId: user.id,
    action: 'boxset.create',
    entityType: 'boxset',
    entityId: String(id),
    summary: `Создан бокс-сет «${parsed.data.name}»`,
  })
  revalidatePath('/admin/box-sets')
  redirect(`/admin/box-sets/${id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: z.string().trim().min(1, 'Введите slug'),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0),
  discount: z.coerce.number().int().min(0).max(100).optional(),
  image: z.string().optional(),
  isPublished: z.boolean(),
  isActive: z.boolean(),
})

export async function updateBoxSetAction(_prev: BoxSetActionResult | null, formData: FormData): Promise<BoxSetActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: (formData.get('description') as string) || undefined,
    price: formData.get('price'),
    discount: (formData.get('discount') as string) || undefined,
    image: (formData.get('image') as string) || undefined,
    isPublished: formData.get('isPublished') === 'on',
    isActive: formData.get('isActive') === 'on',
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('BoxSets')
    .update({
      name: d.name,
      slug: d.slug,
      description: d.description ?? null,
      price: d.price,
      discount: d.discount ?? null,
      image: d.image ?? null,
      is_published: d.isPublished,
      is_active: d.isActive,
    })
    .eq('id', d.id)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/box-sets/${d.id}`)
  revalidatePath('/admin/box-sets')
  return { status: 'ok' }
}

export async function deleteBoxSetAction(_prev: BoxSetActionResult | null, formData: FormData): Promise<BoxSetActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: bs } = await admin.from('BoxSets').select('name').eq('id', id).maybeSingle()
  const { error } = await admin.from('BoxSets').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'boxset.delete',
    entityType: 'boxset',
    entityId: String(id),
    summary: `Удалён бокс-сет «${bs?.name ?? id}»`,
  })
  revalidatePath('/admin/box-sets')
  redirect('/admin/box-sets')
}

const addBookSchema = z.object({
  boxSetId: z.coerce.number().int().positive(),
  titleId: z.coerce.number().int().positive(),
  productId: z.string().trim().optional(),
})

export async function addBoxSetBookAction(formData: FormData): Promise<BoxSetActionResult> {
  await requireAdmin()
  const parsed = addBookSchema.safeParse({
    boxSetId: formData.get('boxSetId'),
    titleId: formData.get('titleId'),
    productId: (formData.get('productId') as string) || undefined,
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { count } = await admin
    .from('BoxSetBooks')
    .select('id', { count: 'exact', head: true })
    .eq('box_set_id', parsed.data.boxSetId)
  const id = await nextId(admin, 'BoxSetBooks')
  const writer = admin.from('BoxSetBooks') as unknown as LooseWriter
  const { error } = await writer.insert({
    id,
    box_set_id: parsed.data.boxSetId,
    title_id: parsed.data.titleId,
    product_id: parsed.data.productId || null,
    position: count ?? 0,
  })
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/box-sets/${parsed.data.boxSetId}`)
  return { status: 'ok' }
}

export async function removeBoxSetBookAction(formData: FormData): Promise<BoxSetActionResult> {
  await requireAdmin()
  const boxSetId = Number(formData.get('boxSetId'))
  const linkId = Number(formData.get('linkId'))
  if (!Number.isInteger(linkId) || linkId <= 0) return { status: 'error', message: 'Неверная позиция.' }

  const admin = createAdminClient()
  const { error } = await admin.from('BoxSetBooks').delete().eq('id', linkId)
  if (error) return { status: 'error', message: error.message }

  revalidatePath(`/admin/box-sets/${boxSetId}`)
  return { status: 'ok' }
}
