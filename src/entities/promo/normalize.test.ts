import { describe, it, expect } from 'vitest'
import { normalizePromoCode, normalizeAppliedPromo } from './normalize'
import type { PromoCodeServerRow } from './server'

const cartRow = {
  id: 'p1',
  code: 'SUMMER25',
  kind: 'cart',
  target_title_id: null,
  target_product_id: null,
  discount_pct: 25,
  starts_at: '2026-01-01T00:00:00Z',
  ends_at: '2026-12-31T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
} satisfies PromoCodeServerRow

describe('normalizePromoCode', () => {
  it('maps snake_case server columns to the camelCase client shape', () => {
    expect(normalizePromoCode(cartRow)).toEqual({
      id: 'p1',
      code: 'SUMMER25',
      kind: 'cart',
      targetTitleId: null,
      targetProductId: null,
      discountPct: 25,
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2026-12-31T00:00:00Z',
    })
  })

  it('preserves an item-level target', () => {
    const itemRow = { ...cartRow, kind: 'item', target_title_id: 7, target_product_id: 'PrintBook-7' }
    const result = normalizePromoCode(itemRow)
    expect(result.kind).toBe('item')
    expect(result.targetTitleId).toBe(7)
    expect(result.targetProductId).toBe('PrintBook-7')
  })

  it('throws on an unexpected kind', () => {
    expect(() => normalizePromoCode({ ...cartRow, kind: 'bogus' })).toThrow(/Unexpected promo kind/)
  })
})

describe('normalizeAppliedPromo', () => {
  it('adds appliedAt to the normalized code', () => {
    const applied = normalizeAppliedPromo(cartRow, '2026-06-01T12:00:00Z')
    expect(applied.appliedAt).toBe('2026-06-01T12:00:00Z')
    expect(applied.code).toBe('SUMMER25')
  })
})
