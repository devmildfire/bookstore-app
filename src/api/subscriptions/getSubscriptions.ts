import { createClient } from '@/lib/supabase/server'
import { normalizeSubscription, type Subscription, type SubscriptionRow } from '@/entities/subscription'

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
