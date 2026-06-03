import 'server-only'
import { getPaymentConfig } from '../config'
import { chargeRecurring } from './client'
import { createAdminClient } from '@/lib/supabase/server'

export type ChargeSubscriptionResult =
  | { status: 'ok'; orderId: number }
  | { status: 'error'; message: string; orderId?: number }

/**
 * Run one merchant-initiated recurring charge for a subscription: build the
 * next period's pending order, then POST to the gateway's recurring endpoint
 * (mock or real /Merchant/Recurring). The gateway notifies our ResultURL, which
 * settles the order and advances the subscription's next_charge_at.
 */
export async function chargeSubscription(
  userSubscriptionId: number
): Promise<ChargeSubscriptionResult> {
  const cfg = getPaymentConfig()
  const admin = createAdminClient()

  const { data, error } = await admin.rpc('create_recurring_order', {
    p_user_subscription_id: userSubscriptionId,
    p_provider: cfg.provider,
  })
  if (error) return { status: 'error', message: error.message }

  const payload = data as {
    status: string
    orderId?: number
    amount?: number
    previousInvId?: number
    reason?: string
  }
  if (payload.status !== 'ok' || !payload.orderId || payload.previousInvId == null) {
    return { status: 'error', message: payload.reason ?? 'create_failed' }
  }

  const res = await chargeRecurring({
    invId: payload.orderId,
    previousInvId: payload.previousInvId,
    amount: payload.amount ?? 0,
  })
  if (res.status !== 'ok') {
    return { status: 'error', message: res.message, orderId: payload.orderId }
  }
  return { status: 'ok', orderId: payload.orderId }
}
