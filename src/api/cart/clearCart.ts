import { getAuthedClient } from '@/lib/supabase/authedClient'

export async function clearCart(): Promise<void> {
  const supabase = await getAuthedClient()

  const { error } = await supabase
    .from('Cart')
    .delete()
    .neq('id', 'none')

  if (error) throw new Error(`Не удалось очистить корзину: ${error.message}`)
}
