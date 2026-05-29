import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { normalizeGiftCard } from '@/entities/giftCard/normalize'
import type { GiftCard } from '@/entities/giftCard/client'
import type { GiftCardRow } from '@/entities/giftCard/server'

const SELECT = '*, GiftCardProducts(*)'

export const userGiftCardsQueryKey = ['giftCards', 'user'] as const

export async function getUserGiftCards(): Promise<GiftCard[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('GiftCards')
    .select(SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Не удалось загрузить карты даров: ${error.message}`)

  return ((data ?? []) as GiftCardRow[]).map(normalizeGiftCard)
}
