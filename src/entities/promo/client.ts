export type PromoKind = 'cart' | 'item'

export type PromoCode = {
  id: string
  code: string
  kind: PromoKind
  targetTitleId: number | null
  targetProductId: string | null
  discountPct: number
  startsAt: string
  endsAt: string
}

export type AppliedPromo = PromoCode & {
  appliedAt: string
}
