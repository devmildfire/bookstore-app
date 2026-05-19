import { getSubscriptionImageUrl } from '@/lib/storage'
import type { SubscriptionRow } from './server'
import type { Subscription } from './client'

export function normalizeSubscription(raw: SubscriptionRow): Subscription {
  const discount = raw.discount ?? null
  const originalPrice = discount ? Math.round(raw.price / (1 - discount / 100)) : null

  return {
    id: raw.id,
    cartId: `Subscription-${raw.id}`,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    perks: raw.perks,
    price: raw.price,
    discount,
    originalPrice,
    imageUrl: getSubscriptionImageUrl(raw.image),
    imageBlurDataUrl: raw.image_blur ?? null,
    position: raw.position,
    publishedAt: raw.publish_date,
  }
}
