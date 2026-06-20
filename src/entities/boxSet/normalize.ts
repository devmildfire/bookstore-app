import { getBoxSetImageUrl } from '@/lib/storage'
import type { BoxSetRow } from './server'
import type { BoxSet } from './client'

export function normalizeBoxSet(
  raw: Pick<BoxSetRow, 'id' | 'slug' | 'name' | 'description' | 'price' | 'discount' | 'image' | 'position' | 'publish_date'>,
): BoxSet {
  const discount = raw.discount ?? null
  const originalPrice = discount ? Math.round(raw.price / (1 - discount / 100)) : null
  return {
    id: raw.id,
    cartId: `BoxSet-${raw.id}`,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    price: raw.price,
    discount,
    originalPrice,
    imageUrl: getBoxSetImageUrl(raw.image),
    position: raw.position,
    publishedAt: raw.publish_date,
  }
}
