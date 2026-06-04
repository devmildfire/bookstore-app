import { createAdminClient } from '@/lib/supabase/server'

export type PromoKind = 'cart' | 'item'

export type AdminPromoCodeListItem = {
  id: string
  code: string
  kind: PromoKind
  discountPct: number
  startsAt: string
  endsAt: string
  isActive: boolean
}

export type AdminPromoCode = {
  id: string
  code: string
  kind: PromoKind
  targetTitleId: number | null
  targetTitleName: string | null
  targetProductId: string | null
  discountPct: number
  startsAt: string
  endsAt: string
}

export async function getAdminPromoCodes(): Promise<AdminPromoCodeListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('PromoCodes')
    .select('id, code, kind, discount_pct, starts_at, ends_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Не удалось загрузить промокоды: ${error.message}`)
  const now = Date.now()
  return (data ?? []).map((p) => ({
    id: p.id,
    code: p.code,
    kind: p.kind as PromoKind,
    discountPct: p.discount_pct,
    startsAt: p.starts_at,
    endsAt: p.ends_at,
    isActive: new Date(p.starts_at).getTime() <= now && now < new Date(p.ends_at).getTime(),
  }))
}

export async function getAdminPromoCode(id: string): Promise<AdminPromoCode | null> {
  const admin = createAdminClient()
  const { data: p, error } = await admin.from('PromoCodes').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить промокод: ${error.message}`)
  if (!p) return null

  let targetTitleName: string | null = null
  if (p.target_title_id) {
    const { data: t } = await admin.from('Titles').select('name').eq('id', p.target_title_id).maybeSingle()
    targetTitleName = t?.name ?? null
  }

  return {
    id: p.id,
    code: p.code,
    kind: p.kind as PromoKind,
    targetTitleId: p.target_title_id,
    targetTitleName,
    targetProductId: p.target_product_id,
    discountPct: p.discount_pct,
    startsAt: p.starts_at,
    endsAt: p.ends_at,
  }
}
