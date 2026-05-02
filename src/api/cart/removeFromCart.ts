import { createClient } from '@/lib/supabase/client'

export async function removeFromCart(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('Cart')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Не удалось удалить из корзины: ${error.message}`)
}
