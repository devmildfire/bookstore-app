import { createClient } from '@/lib/supabase/client'
import { normalizeCartItem } from '@/entities/cart/normalize'
import type { CartItem } from '@/entities/cart/client'

export const cartQueryKey = ['cart'] as const

export async function getCart(): Promise<CartItem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('Cart')
    .select('*')

  if (error) {
    throw new Error(`Не удалось загрузить корзину: ${error.message}`)
  }

  return (data ?? []).map(normalizeCartItem)
}
