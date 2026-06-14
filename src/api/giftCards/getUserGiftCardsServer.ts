import { createClient } from '@/lib/supabase/server'
import { normalizeGiftCard, type GiftCard, type GiftCardRow } from '@/entities/giftCard'

const SELECT = '*, GiftCardProducts(*)'

export async function getUserGiftCardsServer(): Promise<GiftCard[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('GiftCards')
    .select(SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)

  return ((data ?? []) as GiftCardRow[]).map(normalizeGiftCard)
}
