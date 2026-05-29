import { createClient } from '@/lib/supabase/server'
import { normalizeGiftCardProduct } from '@/entities/giftCardProduct/normalize'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'

export async function getGiftCardProducts(): Promise<GiftCardProduct[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('GiftCardProducts')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)

  return (data ?? []).map(normalizeGiftCardProduct)
}
