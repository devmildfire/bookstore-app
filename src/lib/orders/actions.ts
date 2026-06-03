'use server'

import { placeOrder } from '@/api/orders/placeOrder'
import { createPendingOrder } from '@/api/orders/createPendingOrder'
import { getDownloadUrl } from '@/api/orders/getDownloadUrl'
import { getPaymentConfig } from '@/lib/payments/config'
import { buildInitRedirect } from '@/lib/payments/robokassa/client'
import { createAdminClient } from '@/lib/supabase/server'
import type { PaymentRedirect } from '@/lib/payments/robokassa/types'
import type {
  PlaceOrderInput,
  PlaceOrderResult,
  DownloadUrlResult,
} from '@/api/orders'

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return placeOrder(input)
}

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
