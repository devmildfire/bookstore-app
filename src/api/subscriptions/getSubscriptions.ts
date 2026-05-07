import { createClient } from '@/lib/supabase/server'
import { normalizeSubscription } from '@/entities/subscription/normalize'
import type { Subscription } from '@/entities/subscription/client'
import type { SubscriptionRow } from '@/entities/subscription/server'

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Subscriptions')
    .select('*')
    .eq('is_active', true)
    .order('position')

  if (error) throw error

  return data.map(normalizeSubscription)
}
