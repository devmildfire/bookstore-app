import { createAdminClient } from '@/lib/supabase/server'
import { sendEmail } from './send'
import OrderConfirmation, { type OrderConfirmationItem } from '@/emails/OrderConfirmation'

/**
 * Send the order confirmation email exactly once per paid order. Best-effort:
 * any failure is logged and swallowed so it can never break the payment path.
 *
 * Idempotency is enforced by claim_order_confirmation_email (a single SQL
 * transition on status='paid' AND confirmation_email_sent_at IS NULL). If the
 * actual send then fails, the claim is released so a webhook replay can retry.
 */
export async function sendOrderConfirmationEmail(orderId: number): Promise<void> {
  const admin = createAdminClient()
  try {
    const { data: claimed, error: claimErr } = await admin.rpc(
      'claim_order_confirmation_email',
      { p_order_id: orderId }
    )
    if (claimErr) {
      console.error('[order confirmation] claim failed:', claimErr.message)
      return
    }
    if (claimed !== true) return // already sent, or order not paid

    try {
      const { data: order } = await admin
        .from('Orders')
        .select('id, total, delivery_email, user_id')
        .eq('id', orderId)
        .single()
      if (!order) throw new Error('order row not found')

      const { data: itemRows } = await admin
        .from('OrderItems')
        .select('name, price, quantity, box_set_name')
        .eq('order_id', orderId)

      let to = order.delivery_email
      if (!to) {
        const { data: u } = await admin.auth.admin.getUserById(order.user_id)
        to = u?.user?.email ?? null
      }
      if (!to) {
        console.warn(`[order confirmation] no recipient for order ${orderId}`)
        return
      }

      const items: OrderConfirmationItem[] = (itemRows ?? []).map((r) => ({
        name: r.name,
        quantity: r.quantity,
        price: Number(r.price),
        boxSetName: r.box_set_name,
      }))

      await sendEmail({
        to,
        subject: `Заказ №${order.id} оплачен — Чтиво`,
        react: OrderConfirmation({ orderId: order.id, total: Number(order.total), items }),
      })
    } catch (sendErr) {
      // Release the claim so a replay can retry.
      await admin.rpc('release_order_confirmation_email', { p_order_id: orderId })
      throw sendErr
    }
  } catch (err) {
    console.error(`[order confirmation] failed for order ${orderId}:`, err)
  }
}
