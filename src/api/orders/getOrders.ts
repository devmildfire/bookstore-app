import { createClient } from '@/lib/supabase/client'
import { normalizeOrder } from '@/entities/order/normalize'
import type { Order } from '@/entities/order/client'
import type { OrderItemServerRow, OrderServerRow } from '@/entities/order/server'

export const ordersQueryKey = ['orders'] as const

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient()

  const { data: orders, error: ordersError } = await supabase
    .from('Orders')
    .select('*')
    .order('created_at', { ascending: false })

  if (ordersError) {
    throw new Error(`Не удалось загрузить заказы: ${ordersError.message}`)
  }
  if (!orders || orders.length === 0) return []

  const orderIds = orders.map((o) => o.id)
  const { data: items, error: itemsError } = await supabase
    .from('OrderItems')
    .select('*')
    .in('order_id', orderIds)

  if (itemsError) {
    throw new Error(`Не удалось загрузить товары заказов: ${itemsError.message}`)
  }

  const itemsByOrder = new Map<number, OrderItemServerRow[]>()
  for (const item of items ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? []
    list.push(item)
    itemsByOrder.set(item.order_id, list)
  }

  return (orders as OrderServerRow[]).map((row) =>
    normalizeOrder(row, itemsByOrder.get(row.id) ?? [])
  )
}
