import { createClient } from '@/lib/supabase/client'

export async function removePromoCode(): Promise<void> {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) {
    throw new Error(`Не удалось получить пользователя: ${authError.message}`)
  }
  if (!user) {
    throw new Error('Нет авторизации')
  }

  const { error } = await supabase
    .from('CartPromo')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    throw new Error(`Не удалось удалить промокод: ${error.message}`)
  }
}
