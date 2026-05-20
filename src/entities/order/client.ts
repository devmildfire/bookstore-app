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
}

export type Order = {
  id: number
  status: OrderStatus
  total: number              // what was paid
  originalTotal: number      // sum of original (pre-discount) prices
  bookDiscountTotal: number  // sum of intrinsic book discounts
  promoCode: string | null
  promoDiscount: number      // additional savings beyond book discounts (≥ 0)
  deliveryMethod: DeliveryMethod | null
  deliveryEmail: string | null
  shipping: ShippingAddress | null
  paidAt: string | null
  createdAt: string
  items: OrderItem[]
}
