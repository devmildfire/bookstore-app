'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'

export type FeaturedActionResult = { status: 'ok' } | { status: 'error'; message: string }

type FeaturedWriter = {
  insert: (v: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
}

function revalidateFeatured() {
  revalidatePath('/admin/featured')
  revalidatePath('/') // homepage featured slider
}

export async function addFeaturedTitleAction(formData: FormData): Promise<FeaturedActionResult> {
  const user = await requireAdmin()
  const titleId = Number(formData.get('titleId'))
  if (!Number.isInteger(titleId) || titleId <= 0) return { status: 'error', message: 'Выберите книгу.' }

  const admin = createAdminClient()
  const { data: existing } = await admin
    .from('featured_books')
    .select('id')
    .eq('title_id', titleId)
    .maybeSingle()
  if (existing) return { status: 'error', message: 'Эта книга уже в рекомендованных.' }

  const { data: last } = await admin
    .from('featured_books')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
  const nextOrder = (last?.[0]?.sort_order ?? 0) + 1

  // featured_books.id is an identity column — omit it.
  const writer = admin.from('featured_books') as unknown as FeaturedWriter
  const { error } = await writer.insert({ title_id: titleId, sort_order: nextOrder })
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'featured.add',
    entityType: 'featured',
    entityId: String(titleId),
    summary: `Книга #${titleId} добавлена в рекомендованные`,
  })
  revalidateFeatured()
  return { status: 'ok' }
}

export async function removeFeaturedAction(formData: FormData): Promise<FeaturedActionResult> {
  await requireAdmin()
  const id = Number(formData.get('id'))
  if (!Number.isInteger(id) || id <= 0) return { status: 'error', message: 'Неверная запись.' }

  const admin = createAdminClient()
  const { error } = await admin.from('featured_books').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }
  revalidateFeatured()
  return { status: 'ok' }
}

// Swap sort_order with the previous/next featured entry.
export async function moveFeaturedAction(formData: FormData): Promise<FeaturedActionResult> {
  await requireAdmin()
  const id = Number(formData.get('id'))
  const dir = formData.get('dir') as string | null
  if (!Number.isInteger(id) || (dir !== 'up' && dir !== 'down')) {
    return { status: 'error', message: 'Неверные параметры.' }
  }

  const admin = createAdminClient()
  const { data: rows } = await admin
    .from('featured_books')
    .select('id, sort_order')
    .order('sort_order', { ascending: true })
  const list = rows ?? []
  const idx = list.findIndex((r) => r.id === id)
  if (idx === -1) return { status: 'error', message: 'Запись не найдена.' }
  const swapIdx = dir === 'up' ? idx - 1 : idx + 1
  if (swapIdx < 0 || swapIdx >= list.length) return { status: 'ok' } // already at the edge

  const a = list[idx]
  const b = list[swapIdx]
  await admin.from('featured_books').update({ sort_order: b.sort_order }).eq('id', a.id)
  await admin.from('featured_books').update({ sort_order: a.sort_order }).eq('id', b.id)
  revalidateFeatured()
  return { status: 'ok' }
}
