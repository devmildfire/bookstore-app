import { getSubscriptionImageUrl } from '@/lib/storage'
import type { SubscriptionRow } from './server'
import type { Subscription } from './client'

export function normalizeSubscription(raw: SubscriptionRow): Subscription {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    perks: raw.perks,
    price: raw.price,
    imageUrl: getSubscriptionImageUrl(raw.image),
    position: raw.position,
  }
}
