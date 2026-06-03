'use server'

import { isMockProvider } from './config'
import { chargeSubscription } from './robokassa/recurring'
import { createClient } from '@/lib/supabase/server'

export type SubscriptionActionResult =
  | { status: 'ok' }
  | { status: 'error'; message: string }

/** Owner cancels a recurring subscription — stops all future charges. */
export async function cancelSubscriptionAction(
  userSubscriptionId: number
): Promise<SubscriptionActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_subscription', {
    p_user_subscription_id: userSubscriptionId,
  })
  if (error) return { status: 'error', message: error.message }
  const payload = data as { status: string; reason?: string }
  return payload.status === 'ok'
    ? { status: 'ok' }
    : { status: 'error', message: payload.reason ?? 'cancel_failed' }
}

/**
 * Test-only "charge next period now". Gated to the mock provider — in production
 * recurring charges are driven by the cron route. Verifies the caller owns the
 * subscription (RLS) before charging via the service-role path.
 */
export async function chargeSubscriptionNowAction(
  userSubscriptionId: number
): Promise<SubscriptionActionResult> {
  if (!isMockProvider()) {
    return { status: 'error', message: 'disabled_in_production' }
  }

  const supabase = await createClient()
  const { data: owned } = await supabase
    .from('UserSubscriptions')
    .select('id')
    .eq('id', userSubscriptionId)
    .maybeSingle()
  if (!owned) return { status: 'error', message: 'not_found' }

  const res = await chargeSubscription(userSubscriptionId)
  return res.status === 'ok' ? { status: 'ok' } : { status: 'error', message: res.message }
}
