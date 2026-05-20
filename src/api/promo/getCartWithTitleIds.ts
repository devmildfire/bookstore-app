import { createClient } from '@/lib/supabase/client'

export const cartTitleIdsQueryKey = ['cart', 'titleIds'] as const

export type CartTitleIdRow = {
  cartId: string
  titleId: number
}

export async function getCartWithTitleIds(): Promise<CartTitleIdRow[]> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('get_cart_with_title_ids')

  if (error) {
    throw new Error(`Не удалось получить связи корзины с книгами: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    cartId: row.cart_id,
    titleId: row.title_id,
  }))
}
