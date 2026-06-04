'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'

export type PromoActionResult = { status: 'ok' } | { status: 'error'; message: string }

const baseSchema = z.object({
  code: z.string().trim().min(2, 'Введите код').max(40),
  kind: z.enum(['cart', 'item']),
  targetTitleId: z.coerce.number().int().positive().optional(),
  targetProductId: z.string().trim().optional(),
  discountPct: z.coerce.number().int().min(1, 'Скидка 1–100').max(100, 'Скидка 1–100'),
  startsAt: z.string().min(1, 'Укажите начало'),
  endsAt: z.string().min(1, 'Укажите окончание'),
})

type Resolved = {
  code: string
  kind: 'cart' | 'item'
  target_title_id: number | null
  target_product_id: string | null
  discount_pct: number
  starts_at: string
  ends_at: string
}

function resolve(formData: FormData): { ok: true; row: Resolved } | { ok: false; message: string } {
  const parsed = baseSchema.safeParse({
    code: formData.get('code'),
    kind: formData.get('kind'),
    targetTitleId: (formData.get('targetTitleId') as string) || undefined,
    targetProductId: (formData.get('targetProductId') as string) || undefined,
    discountPct: formData.get('discountPct'),
    startsAt: formData.get('startsAt'),
    endsAt: formData.get('endsAt'),
  })
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message }
  const d = parsed.data

  let titleId: number | null = null
  let productId: string | null = null
  if (d.kind === 'item') {
    titleId = d.targetTitleId ?? null
    productId = d.targetProductId?.trim() || null
    if ((titleId && productId) || (!titleId && !productId)) {
      return { ok: false, message: 'Для кода на товар укажите ровно одно: книгу ИЛИ product_id.' }
    }
  }

  const starts = new Date(d.startsAt)
  const ends = new Date(d.endsAt)
  if (Number.isNaN(starts.getTime()) || Number.isNaN(ends.getTime())) {
    return { ok: false, message: 'Неверный формат дат.' }
  }
  if (starts >= ends) return { ok: false, message: 'Начало должно быть раньше окончания.' }

  return {
    ok: true,
    row: {
      code: d.code.toUpperCase(),
      kind: d.kind,
      target_title_id: titleId,
      target_product_id: productId,
      discount_pct: d.discountPct,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
    },
  }
}

export async function createPromoCodeAction(_prev: PromoActionResult | null, formData: FormData): Promise<PromoActionResult> {
  const user = await requireAdmin()
  const r = resolve(formData)
  if (!r.ok) return { status: 'error', message: r.message }

  const admin = createAdminClient()
  const { error } = await admin.from('PromoCodes').insert(r.row)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Такой код уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  await logAdminAction({
    actorUserId: user.id,
    action: 'promo.create',
    entityType: 'promo',
    entityId: r.row.code,
    summary: `Создан промокод ${r.row.code} (${r.row.discount_pct}%)`,
  })
  revalidatePath('/admin/promo-codes')
  redirect('/admin/promo-codes')
}

export async function updatePromoCodeAction(_prev: PromoActionResult | null, formData: FormData): Promise<PromoActionResult> {
  await requireAdmin()
  const id = (formData.get('id') as string) || ''
  if (!id) return { status: 'error', message: 'Неверный id.' }
  const r = resolve(formData)
  if (!r.ok) return { status: 'error', message: r.message }

  const admin = createAdminClient()
  const { error } = await admin.from('PromoCodes').update(r.row).eq('id', id)
  if (error) {
    const msg = error.message.includes('duplicate') ? 'Такой код уже существует.' : error.message
    return { status: 'error', message: msg }
  }
  revalidatePath(`/admin/promo-codes/${id}`)
  revalidatePath('/admin/promo-codes')
  return { status: 'ok' }
}

export async function deletePromoCodeAction(_prev: PromoActionResult | null, formData: FormData): Promise<PromoActionResult> {
  const user = await requireAdmin()
  const id = (formData.get('id') as string) || ''
  if (!id) return { status: 'error', message: 'Неверный id.' }

  const admin = createAdminClient()
  const { data: p } = await admin.from('PromoCodes').select('code').eq('id', id).maybeSingle()
  const { error } = await admin.from('PromoCodes').delete().eq('id', id)
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'promo.delete',
    entityType: 'promo',
    entityId: p?.code ?? id,
    summary: `Удалён промокод ${p?.code ?? id}`,
  })
  revalidatePath('/admin/promo-codes')
  redirect('/admin/promo-codes')
}
