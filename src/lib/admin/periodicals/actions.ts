'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'

export type PeriodicalActionResult = { status: 'ok' } | { status: 'error'; message: string }

const slugField = z
  .string()
  .trim()
  .min(1, 'Введите slug')
  .regex(/^[a-z0-9-]+$/, 'Slug: только латиница, цифры и дефис')

const createSchema = z.object({
  name: z.string().trim().min(1, 'Введите название'),
  slug: slugField,
})

export async function createPeriodicalAction(
  _prev: PeriodicalActionResult | null,
  formData: FormData,
): Promise<PeriodicalActionResult> {
  const user = await requireAdmin()
  const parsed = createSchema.safeParse({ name: formData.get('name'), slug: formData.get('slug') })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }

  const admin = createAdminClient()
  const { data: last } = await admin
    .from('Periodicals')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const sortOrder = (last?.sort_order ?? -1) + 1

  const { data, error } = await admin
    .from('Periodicals')
    .insert({ name: parsed.data.name, slug: parsed.data.slug, sort_order: sortOrder })
    .select('id')
    .single()
  if (error || !data) {
    const msg = error?.message.includes('duplicate')
      ? 'Серия с таким slug уже существует.'
      : (error?.message ?? 'Не удалось создать серию.')
    return { status: 'error', message: msg }
  }

  await logAdminAction({
    actorUserId: user.id,
    action: 'periodical.create',
    entityType: 'periodical',
    entityId: String(data.id),
    summary: `Создана серия «${parsed.data.name}»`,
  })
  revalidatePath('/admin/periodicals')
  redirect(`/admin/periodicals/${data.id}`)
}

const updateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().trim().min(1, 'Введите название'),
  slug: slugField,
  description: z
    .string()
    .trim()
    .transform((v) => (v === '' ? null : v))
    .nullable(),
  position: z.coerce.number().int().min(0),
})

export async function updatePeriodicalAction(
  _prev: PeriodicalActionResult | null,
  formData: FormData,
): Promise<PeriodicalActionResult> {
  await requireAdmin()
  const parsed = updateSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description'),
    position: formData.get('position'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0].message }
  const d = parsed.data

  const admin = createAdminClient()
  const { error } = await admin
    .from('Periodicals')
    .update({ name: d.name, slug: d.slug, description: d.description, sort_order: d.position })
    .eq('id', d.id)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Серия с таким slug уже существует.' : error.message
    return { status: 'error', message: msg }
  }

  revalidatePath(`/admin/periodicals/${d.id}`)
  revalidatePath('/admin/periodicals')
  revalidatePath(`/books/${d.slug}`)
  return { status: 'ok' }
}

// Deleting a periodical unlinks its issues (Titles.periodical_id ON DELETE SET NULL);
// the issue books themselves are kept.
export async function deletePeriodicalAction(
  _prev: PeriodicalActionResult | null,
  formData: FormData,
): Promise<PeriodicalActionResult> {
  const user = await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: periodical } = await admin.from('Periodicals').select('name').eq('id', id).maybeSingle()
  const { error } = await admin.from('Periodicals').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'periodical.delete',
    entityType: 'periodical',
    entityId: String(id),
    summary: `Удалена серия «${periodical?.name ?? id}»`,
  })
  revalidatePath('/admin/periodicals')
  redirect('/admin/periodicals')
}
