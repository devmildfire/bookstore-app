import { createClient } from '@/lib/supabase/server'
import { normalizeCartItem } from '@/entities/cart/normalize'
import { parseCartQuote, type CartQuote } from './quoteCart'
import type { CartItem } from '@/entities/cart/client'

// Server (cookie-client) counterparts of getCart / getCartQuote, for prefetch +
// hydrate in the (site) layout. Same queryKeys (cartQueryKey / cartQuoteQueryKey)
// as the browser versions so the cart context's useQuery hydrates instantly and
// stays reactive to the optimistic add/remove + invalidations.

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
