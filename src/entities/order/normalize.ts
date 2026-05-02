import type { Order, OrderItem } from './client'

export type OrderRaw = {
  id: number
  user_id: string | null
  status: string
  total: number
  delivery_method: string | null
  delivery_email: string | null
  created_at: string
}

export type OrderItemRaw = {
  id: number
  order_id: number
  book_id: string
  name: string
  price: number
  quantity: number
  category: string | null
}

export function normalizeOrder(raw: OrderRaw, items: OrderItem[] = []): Order {
  return {
    id: raw.id,
    userId: raw.user_id,
    status: raw.status,
    total: raw.total,
    deliveryMethod: raw.delivery_method,
    deliveryEmail: raw.delivery_email,
    createdAt: raw.created_at,
    items,
  }
}

export function normalizeOrderItem(raw: OrderItemRaw): OrderItem {
  return {
    id: raw.id,
    orderId: raw.order_id,
    bookId: raw.book_id,
    name: raw.name,
    price: raw.price,
    quantity: raw.quantity,
    category: raw.category,
  }
}
