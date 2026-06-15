import { createClient } from '@/lib/supabase/server'
import { loadOrders } from './getOrders'
import type { Order } from '@/entities/order/client'

// Server (cookie-client) counterparts of getOrders / getOrderHistory, for
// prefetch + hydrate on the profile pages. Same queryKeys as the browser
// versions (ordersQueryKey / orderHistoryQueryKey) so the client useQuery
// hydrates instantly and stays reactive for invalidation after mutations.

export async function getOrdersServer(): Promise<Order[]> {
  return loadOrders(await createClient(), ['paid'])
}

export async function getOrderHistoryServer(): Promise<Order[]> {
  return loadOrders(await createClient(), null)
}
