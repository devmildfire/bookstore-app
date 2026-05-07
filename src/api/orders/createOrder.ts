import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/entities/cart/client'
import type { DbOrderInsert, DbOrderItemInsert } from '@/types/database'

type CreateOrderResult = {
  orderId: number
  success: boolean
}

export async function createOrder(items: CartItem[], deliveryEmail?: string): Promise<CreateOrderResult> {
  const supabase = createClient()

  const orderInsert: DbOrderInsert = {
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

  if (orderError) throw new Error(`Не удалось создать заказ: ${orderError.message}`)

  const orderItems: DbOrderItemInsert[] = items.map((item) => ({
    order_id: order.id,
    book_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    category: item.category,
  }))

  const { error: itemsError } = await supabase.from('OrderItems').insert(orderItems)

  if (itemsError) throw new Error(`Не удалось сохранить товары заказа: ${itemsError.message}`)

  return { orderId: order.id, success: true }
}
