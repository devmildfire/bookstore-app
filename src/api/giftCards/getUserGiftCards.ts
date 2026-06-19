import { getAuthedClient } from '@/lib/supabase/authedClient'
import { normalizeGiftCard, type GiftCard, type GiftCardRow } from '@/entities/giftCard'

const SELECT = '*, GiftCardProducts(*)'

export const userGiftCardsQueryKey = ['giftCards', 'user'] as const

export async function getUserGiftCards(): Promise<GiftCard[]> {
  const supabase = await getAuthedClient()

  const { data, error } = await supabase
    .from('GiftCards')
    .select(SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)

  return ((data ?? []) as GiftCardRow[]).map(normalizeGiftCard)
}
