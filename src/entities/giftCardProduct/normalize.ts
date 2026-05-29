import type { GiftCardProduct } from './client'
import type { GiftCardProductRow } from './server'

export function normalizeGiftCardProduct(raw: GiftCardProductRow): GiftCardProduct {
  return {
    id: raw.id,
    cartId: `GiftCard-${raw.id}`,
    slug: raw.slug,
    name: raw.name,
    faceValue: raw.face_value,
    sortOrder: raw.sort_order,
  }
}
