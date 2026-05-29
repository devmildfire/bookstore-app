import type { ProductCategory } from '@/types/database'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'
export type DeliveryMethod = 'shipping' | 'email' | 'download'

export type ShippingAddress = {
  name: string
  phone: string
  city: string
  street: string
  building: string
  postalCode: string
}

export type OrderItem = {
  id: number
  bookId: string
  name: string
  price: number
  quantity: number
  category: ProductCategory
  // Snapshot of the parent BoxSets.name when this item was sold as
  // part of a box set. NULL for standalone items. UI shows it as a
  // small "Из бокс-сета «<name>»" label.
  boxSetName: string | null
  // Enriched in getOrders by joining the edition table → Titles. Null
  // when the title lookup fails (e.g. title deleted after purchase).
  coverUrl: string | null
  titleSlug: string | null
}

export type Order = {
  id: number
  status: OrderStatus
  total: number              // order value after built-in/promo discounts
  originalTotal: number      // sum of original (pre-discount) prices
  bookDiscountTotal: number  // sum of intrinsic book discounts
  promoCode: string | null
  promoDiscount: number      // additional savings beyond book discounts (≥ 0)
  giftCardTotalApplied: number
  amountDue: number          // cash/PSP amount after wallet cards
  deliveryMethod: DeliveryMethod | null
  deliveryEmail: string | null
  shipping: ShippingAddress | null
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
}
