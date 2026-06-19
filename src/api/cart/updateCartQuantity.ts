import { getAuthedClient } from '@/lib/supabase/authedClient'

export async function updateCartQuantity(id: string, quantity: number): Promise<void> {
  const supabase = await getAuthedClient()

  if (quantity <= 0) {
    // Remove item if quantity is 0 or negative
    const { error } = await supabase
      .from('Cart')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Не удалось удалить из корзины: ${error.message}`)
    return
  }

  const { error } = await supabase
    .from('Cart')
    .update({ quantity })
    .eq('id', id)

  if (error) throw new Error(`Не удалось обновить количество: ${error.message}`)
}
