import type { CartItem } from './client'
import type { CartServerRow } from './server'

export function normalizeCartItem(
  raw: Pick<CartServerRow, 'id' | 'name' | 'subtitle' | 'price' | 'quantity' | 'picture' | 'discount' | 'category'>,
): CartItem {
  return {
    id: raw.id,
    name: raw.name,
    subtitle: raw.subtitle,
    price: raw.price ?? 0,
    quantity: raw.quantity ?? 1,
    picture: raw.picture,
    discount: raw.discount,
    category: raw.category,
  }
}
