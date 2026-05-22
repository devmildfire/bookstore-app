import type { ProductCategory } from '@/types/database'
import type {
  DeliveryMethod,
  Order,
  OrderItem,
  OrderStatus,
  ShippingAddress,
} from './client'
import type { OrderItemServerRow, OrderServerRow } from './server'

function asNumber(value: string | number | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

function asStatus(raw: string): OrderStatus {
  switch (raw) {
    case 'pending':
    case 'paid':
    case 'shipped':
    case 'cancelled':
      return raw
    default:
      return 'pending'
  }
}

function asDeliveryMethod(raw: string | null): DeliveryMethod | null {
  if (raw === 'shipping' || raw === 'email' || raw === 'download') return raw
  return null
}

function buildShipping(raw: OrderServerRow): ShippingAddress | null {
  if (!raw.shipping_name) return null
  return {
    name: raw.shipping_name,
    phone: raw.shipping_phone ?? '',
    city: raw.shipping_city ?? '',
    street: raw.shipping_street ?? '',
    building: raw.shipping_building ?? '',
    postalCode: raw.shipping_postal_code ?? '',
  }
}

export function normalizeOrderItem(
  raw: OrderItemServerRow,
  enriched?: { coverUrl: string | null; titleSlug: string | null } | null
): OrderItem {
  return {
    id: raw.id,
    bookId: raw.book_id,
    name: raw.name,
    price: asNumber(raw.price),
    quantity: raw.quantity,
    category: (raw.category as ProductCategory) ?? 'EBook',
    coverUrl: enriched?.coverUrl ?? null,
    titleSlug: enriched?.titleSlug ?? null,
  }
}

export function normalizeOrder(
  raw: OrderServerRow,
  items: OrderItemServerRow[],
  enrichedByItemId?: Map<number, { coverUrl: string | null; titleSlug: string | null }>
): Order {
  return {
    id: raw.id,
    status: asStatus(raw.status),
    total: asNumber(raw.total),
    originalTotal: asNumber(raw.original_total),
    bookDiscountTotal: asNumber(raw.book_discount_total),
    promoCode: raw.promo_code,
    promoDiscount: asNumber(raw.promo_discount),
    deliveryMethod: asDeliveryMethod(raw.delivery_method),
    deliveryEmail: raw.delivery_email,
    shipping: buildShipping(raw),
    paidAt: raw.paid_at,
    createdAt: raw.created_at,
    items: items.map((item) => normalizeOrderItem(item, enrichedByItemId?.get(item.id))),
  }
}
