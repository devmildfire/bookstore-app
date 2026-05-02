import { createClient } from '@/lib/supabase/client'

export async function clearCart(): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('Cart')
    .delete()
    .neq('id', 'none')

  if (error) throw new Error(`Не удалось очистить корзину: ${error.message}`)
}
