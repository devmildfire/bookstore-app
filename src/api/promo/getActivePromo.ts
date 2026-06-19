import { getAuthedClient } from '@/lib/supabase/authedClient'
import { normalizeAppliedPromo } from '@/entities/promo/normalize'
import type { AppliedPromo } from '@/entities/promo/client'
import type { PromoCodeServerRow } from '@/entities/promo/server'

export const activePromoQueryKey = ['cart', 'promo'] as const

export async function getActivePromo(): Promise<AppliedPromo | null> {
  const supabase = await getAuthedClient()

  const { data, error } = await supabase
    .from('CartPromo')
    .select('applied_at, promo:PromoCodes(*)')
    .maybeSingle()

  if (error) {
    throw new Error(`Не удалось загрузить промокод: ${error.message}`)
  }

  if (!data || !data.promo) return null

  return normalizeAppliedPromo(data.promo as PromoCodeServerRow, data.applied_at)
}
