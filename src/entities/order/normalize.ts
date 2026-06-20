import type { ProductCategory } from '@/types/database'
import type {
  DeliveryMethod,
  FulfillmentStatus,
  Order,
  OrderItem,
  OrderStatus,
  ShippingAddress,
} from './client'

type OrderRow = Pick<
  import('./server').OrderServerRow,
  'id' | 'status' | 'fulfillment_status' | 'total' | 'original_total' | 'book_discount_total' | 'promo_code' | 'promo_discount' | 'gift_card_total_applied' | 'amount_due' | 'delivery_method' | 'delivery_email' | 'shipping_name' | 'shipping_phone' | 'shipping_city' | 'shipping_street' | 'shipping_building' | 'shipping_postal_code' | 'tracking_number' | 'tracking_carrier' | 'admin_note' | 'paid_at' | 'created_at'
>

type OrderItemRow = Pick<
  import('./server').OrderItemServerRow,
  'id' | 'book_id' | 'name' | 'price' | 'quantity' | 'category' | 'box_set_name' | 'order_id'
>

function asNumber(value: string | number | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'number' ? value : Number(value)
}

function asStatus(raw: string): OrderStatus {
  switch (raw) {
    case 'pending':
    case 'paid':
    case 'failed':
    case 'cancelled':
      return raw
    default:
      return 'pending'
  }
}

function asFulfillment(raw: string | null | undefined): FulfillmentStatus {
  switch (raw) {
    case 'processing':
    case 'shipped':
    case 'delivered':
    case 'completed':
      return raw
    default:
      return 'processing'
  }
}

function asDeliveryMethod(raw: string | null): DeliveryMethod | null {
  if (raw === 'shipping' || raw === 'email' || raw === 'download') return raw
  return null
}

function buildShipping(raw: OrderRow): ShippingAddress | null {
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
  raw: OrderItemRow,
  enriched?: { coverUrl: string | null; titleSlug: string | null } | null
): OrderItem {
  return {
    id: raw.id,
    bookId: raw.book_id,
    name: raw.name,
    price: asNumber(raw.price),
    quantity: raw.quantity,
    category: (raw.category as ProductCategory) ?? 'EBook',
    boxSetName: raw.box_set_name ?? null,
    coverUrl: enriched?.coverUrl ?? null,
    titleSlug: enriched?.titleSlug ?? null,
  }
}

export function normalizeOrder(
  raw: OrderRow,
  items: OrderItemRow[],
  enrichedByItemId?: Map<number, { coverUrl: string | null; titleSlug: string | null }>,
  subscriptionStatus?: string | null
): Order {
  return {
    id: raw.id,
    status: asStatus(raw.status),
    fulfillmentStatus: asFulfillment(raw.fulfillment_status),
    subscriptionStatus: subscriptionStatus ?? null,
    total: asNumber(raw.total),
    originalTotal: asNumber(raw.original_total),
    bookDiscountTotal: asNumber(raw.book_discount_total),
    promoCode: raw.promo_code,
    promoDiscount: asNumber(raw.promo_discount),
    giftCardTotalApplied: asNumber(raw.gift_card_total_applied),
    amountDue: asNumber(raw.amount_due),
    deliveryMethod: asDeliveryMethod(raw.delivery_method),
    deliveryEmail: raw.delivery_email,
    shipping: buildShipping(raw),
    trackingNumber: raw.tracking_number ?? null,
    trackingCarrier: raw.tracking_carrier ?? null,
    adminNote: raw.admin_note ?? null,
    paidAt: raw.paid_at,
    createdAt: raw.created_at,
    items: items.map((item) => normalizeOrderItem(item, enrichedByItemId?.get(item.id))),
  }
}
