import { createAdminClient } from '@/lib/supabase/server'
import { normalizeOrder } from '@/entities/order/normalize'
import type { Order } from '@/entities/order/client'
import type { OrderServerRow } from '@/entities/order/server'

export type AdminOrderFilters = {
  status?: string
  fulfillment?: string
  q?: string
  page?: number
}

export type AdminOrdersResult = {
  orders: Order[]
  total: number
  page: number
  pageSize: number
}

export const ADMIN_ORDERS_PAGE_SIZE = 25

// All orders, newest first, with optional filters. Service-role read (RLS on
// Orders is owner-scoped, so admins must use the admin client). Order items are
// not loaded for the list — the detail view fetches them.
export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminOrdersResult> {
  const admin = createAdminClient()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = ADMIN_ORDERS_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('Orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.fulfillment) query = query.eq('fulfillment_status', filters.fulfillment)

  const q = filters.q?.trim()
  if (q) {
    if (/^\d+$/.test(q)) query = query.eq('id', Number(q))
    else query = query.ilike('delivery_email', `%${q}%`)
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw new Error(`Не удалось загрузить заказы: ${error.message}`)

  const orders = ((data ?? []) as OrderServerRow[]).map((row) => normalizeOrder(row, []))
  return { orders, total: count ?? 0, page, pageSize }
}
