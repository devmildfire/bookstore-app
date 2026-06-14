import { getSubscriptionImageUrl } from '@/lib/storage'
import type { Database } from '@/types/supabase'

export type SubscriptionRow = Database['public']['Tables']['Subscriptions']['Row']

export type Subscription = {
  id: number
  cartId: string
  slug: string
  name: string
  description: string | null
  perks: string[]
  price: number
  discount: number | null
  originalPrice: number | null
  imageUrl: string | null
  imageBlurDataUrl: string | null
  position: number
  publishedAt: string | null
}

export function normalizeSubscription(
  raw: Pick<
    SubscriptionRow,
    | 'id'
    | 'slug'
    | 'name'
    | 'description'
    | 'perks'
    | 'price'
    | 'discount'
    | 'image'
    | 'image_blur'
    | 'position'
    | 'publish_date'
  >,
): Subscription {
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
