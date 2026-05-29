import type { CartItem } from '@/entities/cart/client'
import type { AppliedPromo } from '@/entities/promo/client'

export type CartTotals = {
  subtotal: number       // Σ (price × qty) — post-book-discount, shown as "Сумма"
  discountAmount: number // additional savings from the promo beyond book discounts (≥ 0)
  total: number          // = subtotal − discountAmount, shown as "Итого"
  giftCardEligibleTotal: number // max wallet amount: total excluding new gift-card rows
}

function originalUnitPrice(item: CartItem): number {
  if (item.discount != null && item.discount > 0) {
    return Math.round(item.price / (1 - item.discount / 100))
  }
  return item.price
}

function isPromoActive(promo: AppliedPromo, now: Date): boolean {
  const start = new Date(promo.startsAt).getTime()
  const end = new Date(promo.endsAt).getTime()
  const t = now.getTime()
  return t >= start && t <= end
}

function isGiftCardItem(item: CartItem): boolean {
  return item.category === 'GiftCard'
}

// Pure: computes the totals for a cart and an optional applied promo.
// `matchedCartIds` is the set of Cart row ids whose product belongs to the
// promo's target Title (resolved server-side via the get_cart_with_title_ids
// RPC). For product-target item codes it can be empty — matching is done
// directly via the cart row id. For cart-level codes it is ignored.
export function calculateCartTotals(
  items: CartItem[],
  promo: AppliedPromo | null,
  matchedCartIds: ReadonlySet<string>,
  now: Date = new Date()
): CartTotals {
  let subtotal = 0
  let originalSum = 0
  let discountableSubtotal = 0
  for (const item of items) {
    subtotal += item.price * item.quantity
    if (!isGiftCardItem(item)) {
      originalSum += originalUnitPrice(item) * item.quantity
      discountableSubtotal += item.price * item.quantity
    }
  }
  const bookDiscountTotal = originalSum - discountableSubtotal

  if (!promo || !isPromoActive(promo, now)) {
    return { subtotal, discountAmount: 0, total: subtotal, giftCardEligibleTotal: discountableSubtotal }
  }

  let totalDiscount = 0

  if (promo.kind === 'cart') {
    const promoAmount = Math.round((originalSum * promo.discountPct) / 100)
    totalDiscount = Math.max(bookDiscountTotal, promoAmount)
  } else {
    // item-level: per-row max(bookDiscOnLine, promoOnLine) when matching
    for (const item of items) {
      if (isGiftCardItem(item)) continue

      const origLine = originalUnitPrice(item) * item.quantity
      const bookDiscOnLine = origLine - item.price * item.quantity

      const matches =
        (promo.targetProductId != null && item.id === promo.targetProductId) ||
        (promo.targetTitleId != null && matchedCartIds.has(item.id))

      const effective = matches
        ? Math.max(bookDiscOnLine, Math.round((origLine * promo.discountPct) / 100))
        : bookDiscOnLine

      totalDiscount += effective
    }
  }

  const discountAmount = Math.max(0, totalDiscount - bookDiscountTotal)
  return {
    subtotal,
    discountAmount,
    total: subtotal - discountAmount,
    giftCardEligibleTotal: Math.max(0, discountableSubtotal - discountAmount),
  }
}
