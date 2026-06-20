'use server'

import { createPendingOrder } from '@/api/orders/createPendingOrder'
import { getDownloadUrl } from '@/api/orders/getDownloadUrl'
import { getPaymentConfig } from '@/lib/payments/config'
import { buildInitRedirect } from '@/lib/payments/robokassa/client'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { sendOrderConfirmationEmail } from '@/lib/email/sendOrderConfirmation'
import type { PaymentRedirect } from '@/lib/payments/robokassa/types'
import type { PlaceOrderInput } from '@/api/orders/createPendingOrder'
import type { DownloadUrlResult } from '@/api/orders/getDownloadUrl'

export async function getDownloadUrlAction(orderItemId: number): Promise<DownloadUrlResult> {
  return getDownloadUrl(orderItemId)
}

export type StartCheckoutResult =
  // Fully covered by gift cards → settled immediately, no gateway.
  | { status: 'paid'; orderId: number }
  // Needs payment → POST the buyer to the gateway with these signed fields.
  | { status: 'redirect'; orderId: number; redirect: PaymentRedirect }
  | { status: 'error'; reason: string; message?: string }

/**
 * Begin checkout: create a pending order (price snapshot + reserved gift cards),
 * then either settle it (nothing left to pay) or hand back the signed Robokassa
 * payment-redirect descriptor for the client to POST. The order is only marked
 * paid by the verified ResultURL webhook (or here, for a 0 ₽ balance).
 */
export async function startCheckoutAction(input: PlaceOrderInput): Promise<StartCheckoutResult> {
  const cfg = getPaymentConfig()
  const pending = await createPendingOrder(input, cfg.provider)
  if (pending.status === 'error') {
    return { status: 'error', reason: pending.reason, message: pending.message }
  }

  if (pending.amountDue <= 0) {
    const admin = createAdminClient()
    const { error } = await admin.rpc('mark_order_paid', {
      p_inv_id: pending.orderId,
      p_out_sum: '0.00',
    })
    if (error) {
      return { status: 'error', reason: 'unknown', message: error.message }
    }
    await sendOrderConfirmationEmail(pending.orderId)
    return { status: 'paid', orderId: pending.orderId }
  }

  const redirect = buildInitRedirect({
    invId: pending.orderId,
    amount: pending.amountDue,
    description: `Заказ №${pending.orderId} — Чтиво`,
    email: input.email,
    recurring: pending.recurring,
  })
  return { status: 'redirect', orderId: pending.orderId, redirect }
}

/**
 * Resume payment for an existing `pending` order (an abandoned checkout the
 * buyer wants to finish). Re-builds the gateway redirect for the SAME InvId
 * against the order's snapshotted amount_due — no new order, no re-pricing. The
 * verified ResultURL webhook settles it via mark_order_paid, exactly as for a
 * fresh checkout. Ownership is enforced by RLS on the user-scoped read.
 */
export async function resumeCheckoutAction(orderId: number): Promise<StartCheckoutResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: 'error', reason: 'not_authenticated' }

  const { data: order, error } = await supabase
    .from('Orders')
    .select('id, user_id, status, amount_due, delivery_email, recurring')
    .eq('id', orderId)
    .maybeSingle()

  if (error) return { status: 'error', reason: 'unknown', message: error.message }
  // RLS already scopes to the owner; the explicit check is defense-in-depth.
  if (!order || order.user_id !== user.id) {
    return { status: 'error', reason: 'order_not_found' }
  }
  if (order.status !== 'pending') return { status: 'error', reason: 'not_pending' }

  // A 0 ₽ balance (e.g. fully covered by gift cards) settles without the gateway.
  if (Number(order.amount_due) <= 0) {
    const admin = createAdminClient()
    const { error: payError } = await admin.rpc('mark_order_paid', {
      p_inv_id: order.id,
      p_out_sum: '0.00',
    })
    if (payError) return { status: 'error', reason: 'unknown', message: payError.message }
    await sendOrderConfirmationEmail(order.id)
    return { status: 'paid', orderId: order.id }
  }

  const redirect = buildInitRedirect({
    invId: order.id,
    amount: Number(order.amount_due),
    description: `Заказ №${order.id} — Чтиво`,
    email: order.delivery_email,
    recurring: order.recurring,
  })
  return { status: 'redirect', orderId: order.id, redirect }
}

export type CancelOrderResult =
  | { status: 'ok'; orderId: number }
  | { status: 'error'; reason: string; message?: string }

/**
 * Cancel an abandoned `pending` order at the buyer's request. Delegates to
 * cancel_pending_order (releases reserved gift-card balances, flips status →
 * 'cancelled'); the user-scoped client makes the RPC enforce ownership.
 */
export async function cancelOrderAction(orderId: number): Promise<CancelOrderResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { status: 'error', reason: 'not_authenticated' }

  const { data, error } = await supabase.rpc('cancel_pending_order', { p_order_id: orderId })
  if (error) return { status: 'error', reason: 'unknown', message: error.message }

  const payload = data as { status: string; reason?: string; orderId?: number }
  if (payload.status === 'error') {
    return { status: 'error', reason: payload.reason ?? 'unknown' }
  }
  return { status: 'ok', orderId: payload.orderId ?? orderId }
}
