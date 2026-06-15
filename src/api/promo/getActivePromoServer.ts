import { createClient } from '@/lib/supabase/server'
import { normalizeAppliedPromo } from '@/entities/promo/normalize'
import type { AppliedPromo } from '@/entities/promo/client'
import type { PromoCodeServerRow } from '@/entities/promo/server'

// Server counterpart of getActivePromo (same activePromoQueryKey), for
// prefetch + hydrate in the (site) layout.
export async function getActivePromoServer(): Promise<AppliedPromo | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('CartPromo')
    .select('applied_at, promo:PromoCodes(*)')
    .maybeSingle()

  if (error) throw new Error(`Не удалось загрузить промокод: ${error.message}`)
  if (!data || !data.promo) return null

  return normalizeAppliedPromo(data.promo as PromoCodeServerRow, data.applied_at)
}
