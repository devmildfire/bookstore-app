import type { AppliedPromo, PromoCode, PromoKind } from './client'
import type { PromoCodeServerRow } from './server'

function normalizeKind(raw: string): PromoKind {
  if (raw === 'cart' || raw === 'item') return raw
  throw new Error(`Unexpected promo kind: ${raw}`)
}

export function normalizePromoCode(raw: PromoCodeServerRow): PromoCode {
  return {
    id: raw.id,
    code: raw.code,
    kind: normalizeKind(raw.kind),
    targetTitleId: raw.target_title_id,
    targetProductId: raw.target_product_id,
    discountPct: raw.discount_pct,
    startsAt: raw.starts_at,
    endsAt: raw.ends_at,
  }
}

export function normalizeAppliedPromo(raw: PromoCodeServerRow, appliedAt: string): AppliedPromo {
  return {
    ...normalizePromoCode(raw),
    appliedAt,
  }
}
