import { createClient } from '@/lib/supabase/client'

export const cartQuoteQueryKey = ['cart', 'quote'] as const

// Server-authoritative cart pricing — the SAME numbers create_pending_order will
// charge (both go through the compute_cart_totals SQL function). The client does NOT
// recompute pricing; it reads this. Gift-card *allocation* (which card, how much) stays
// client-side and is layered on top of `giftCardEligibleTotal`.
export type CartQuote = {
  subtotal: number
  discountAmount: number
  total: number
  giftCardEligibleTotal: number
}

const EMPTY_QUOTE: CartQuote = { subtotal: 0, discountAmount: 0, total: 0, giftCardEligibleTotal: 0 }

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

// Shared by the browser getCartQuote and the server getCartQuoteServer.
export function parseCartQuote(data: unknown): CartQuote {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return EMPTY_QUOTE
  const q = data as Record<string, unknown>
  return {
    subtotal: readNumber(q.subtotal),
    discountAmount: readNumber(q.discountAmount),
    total: readNumber(q.total),
    giftCardEligibleTotal: readNumber(q.giftCardEligibleTotal),
  }
}

export async function getCartQuote(): Promise<CartQuote> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('quote_cart')
  if (error) throw new Error(`Не удалось рассчитать корзину: ${error.message}`)
  return parseCartQuote(data)
}
