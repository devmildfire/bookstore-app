import { createClient } from '@/lib/supabase/server'
import { normalizeCartItem } from '@/entities/cart/normalize'
import { parseCartQuote, type CartQuote } from './quoteCart'
import type { CartItem } from '@/entities/cart/client'

// Server (cookie-client) counterparts of getCart / getCartQuote. The cart +
// checkout pages call these and pass the result to CartView / CheckoutView as
// props, so those views render the real cart on first paint (zero CLS); the
// client useQuery then takes over for optimistic add/remove + invalidations.

export async function getCartServer(): Promise<CartItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Cart')
    .select('id, name, subtitle, price, quantity, picture, discount, category')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить корзину: ${error.message}`)
  return (data ?? []).map(normalizeCartItem)
}

export async function getCartQuoteServer(): Promise<CartQuote> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('quote_cart')
  if (error) throw new Error(`Не удалось рассчитать корзину: ${error.message}`)
  return parseCartQuote(data)
}

// Server-side hasPhysicalItems for the checkout SSR form choice (DeliveryForm
// vs EmailOnlyForm). Mirrors the client computation in CartProvider so the
// right form renders on first paint — no email→delivery swap / CLS.
// ponytail: small duplication of the cart.tsx physicality rule; not worth a
// shared client/server util (different supabase clients, ~10 lines).
const ALWAYS_PHYSICAL = new Set<string>(['PrintBook', 'Book2.0'])

export async function getCartHasPhysicalServer(items: CartItem[]): Promise<boolean> {
  const boxSetIds: number[] = []
  for (const item of items) {
    if (ALWAYS_PHYSICAL.has(item.category)) return true
    if (item.category === 'BoxSet') {
      const editionId = Number(item.id.split('-').slice(1).join('-'))
      if (Number.isFinite(editionId)) boxSetIds.push(editionId)
    }
  }
  if (boxSetIds.length === 0) return false

  const supabase = await createClient()
  for (const id of boxSetIds) {
    const { data } = await supabase.rpc('box_set_is_physical', { p_box_set_id: id })
    if (data) return true
  }
  return false
}
