import { getGiftCardImageUrl } from '@/lib/storage'
import type { Database } from '@/types/supabase'

export type GiftCardProductRow = Database['public']['Tables']['GiftCardProducts']['Row']

export type GiftCardProduct = {
  id: number
  cartId: string
  slug: string
  name: string
  faceValue: number
  sortOrder: number
  imageUrl: string | null
}

export function normalizeGiftCardProduct(raw: GiftCardProductRow): GiftCardProduct {
  return {
    id: raw.id,
    cartId: `GiftCard-${raw.id}`,
    slug: raw.slug,
    name: raw.name,
    faceValue: raw.face_value,
    sortOrder: raw.sort_order,
    imageUrl: getGiftCardImageUrl(raw.image_path),
  }
}
