import { createAdminClient } from '@/lib/supabase/server'
import { normalizeOrder } from '@/entities/order/normalize'
import { normalizeAuditEntry, type AdminAuditEntry } from '@/lib/admin/audit'
import type { Order } from '@/entities/order/client'
import type { OrderItemServerRow, OrderServerRow } from '@/entities/order/server'

export type AdminOrderDetail = {
  order: Order
  customerEmail: string | null
  audit: AdminAuditEntry[]
}

// One order with its items, the buyer's account email, and its audit trail.
export async function getAdminOrder(id: number): Promise<AdminOrderDetail | null> {
  const admin = createAdminClient()

  const { data: row, error } = await admin.from('Orders').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить заказ: ${error.message}`)
  if (!row) return null

  const { data: items } = await admin.from('OrderItems').select('*').eq('order_id', id)
  const order = normalizeOrder(row as OrderServerRow, (items ?? []) as OrderItemServerRow[])

  const { data: auditRows } = await admin
    .from('AdminAuditLog')
    .select('*')
    .eq('entity_type', 'order')
    .eq('entity_id', String(id))
    .order('created_at', { ascending: false })
  const audit = (auditRows ?? []).map(normalizeAuditEntry)

  // Buyer's account email (distinct from the snapshot delivery_email). Best
  // effort — anon buyers have no email.
  let customerEmail: string | null = null
  const userId = (row as OrderServerRow).user_id
  if (userId) {
    const { data: userRes } = await admin.auth.admin.getUserById(userId)
    customerEmail = userRes.user?.email ?? null
  }

  return { order, customerEmail, audit }
}
