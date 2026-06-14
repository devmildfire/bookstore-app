import { createClient } from '@/lib/supabase/server'
import { normalizeSubscription, type Subscription } from '@/entities/subscription'

export async function getSubscriptions(): Promise<Subscription[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Subscriptions')
    .select('id, slug, name, description, perks, price, discount, image, image_blur, position, publish_date')
    .eq('is_active', true)
    .order('position')

  if (error) throw error

  return data.map(normalizeSubscription)
}
