import { createClient } from '@/lib/supabase/server'
import { normalizeGiftCardProduct, type GiftCardProduct } from '@/entities/giftCardProduct'

export async function getGiftCardProducts(): Promise<GiftCardProduct[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('GiftCardProducts')
    .select('id, slug, name, face_value, sort_order, image_path')
    .order('sort_order')

  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)

  return (data ?? []).map(normalizeGiftCardProduct)
}
