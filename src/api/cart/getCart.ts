import { createClient } from '@/lib/supabase/client'
import { normalizeCartItem } from '@/entities/cart/normalize'
import type { CartItem } from '@/entities/cart/client'

export const cartQueryKey = ['cart'] as const

export async function getCart(): Promise<CartItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('Cart')
    .select('*')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true }) // tiebreaker for rows inserted in the same millisecond

  if (error) {
    throw new Error(`Не удалось загрузить корзину: ${error.message}`)
  }

  return (data ?? []).map(normalizeCartItem)
}
