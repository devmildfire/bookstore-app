'use server'

import { createClient } from '@/lib/supabase/server'
import { normalizeCartItem } from '@/entities/cart/normalize'
import type { DbOrderInsert, DbOrderItemInsert } from '@/types/database'

type CreateOrderResult = { orderId: number } | { error: string }

export async function createOrderAction(deliveryEmail?: string): Promise<CreateOrderResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Необходима авторизация' }

  // Read cart from DB server-side — never trust client-provided items or prices
  const { data: cartRows, error: cartError } = await supabase.from('Cart').select('*')
  if (cartError) return { error: `Не удалось прочитать корзину: ${cartError.message}` }
  if (!cartRows || cartRows.length === 0) return { error: 'Корзина пуста' }

  const items = cartRows.map(normalizeCartItem)

  const orderInsert: DbOrderInsert = {
    user_id: user.id,
    status: 'paid',
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    delivery_method: deliveryEmail ? 'email' : 'download',
    delivery_email: deliveryEmail ?? null,
  }

  const { data: order, error: orderError } = await supabase
    .from('Orders')
    .insert(orderInsert)
    .select('id')
    .single()

  if (orderError) return { error: `Не удалось создать заказ: ${orderError.message}` }

  const orderItems: DbOrderItemInsert[] = items.map((item) => ({
    order_id: order.id,
    book_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category: item.category,
  }))

  const { error: itemsError } = await supabase.from('OrderItems').insert(orderItems)
  if (itemsError) return { error: `Не удалось сохранить товары заказа: ${itemsError.message}` }

  return { orderId: order.id }
}
