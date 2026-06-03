import { createClient } from '@/lib/supabase/server'
import type { PlaceOrderInput, PlaceOrderErrorReason } from './placeOrder'

// Creates a `pending` order (price snapshot + reserved gift cards) WITHOUT
// taking payment or wiping the cart. The returned amountDue is what the gateway
// must charge; recurring marks a subscription anchor. Settlement happens later
// via mark_order_paid (the verified ResultURL webhook). Mirrors placeOrder's
// re-pricing inside the create_pending_order RPC — input is never trusted beyond
// shipping/email strings.

export type CreatePendingOrderResult =
  | {
      status: 'ok'
      orderId: number
      finalTotal: number
      giftCardTotalApplied: number
      amountDue: number
      recurring: boolean
      recurringAmount: number
    }
  | { status: 'error'; reason: PlaceOrderErrorReason; message?: string }

type RpcPayload =
  | {
      status: 'ok'
      orderId: number
      finalTotal: number
      giftCardTotalApplied?: number
      amountDue?: number
      recurring?: boolean
      recurringAmount?: number
    }
  | { status: 'error'; reason: PlaceOrderErrorReason }

export async function createPendingOrder(
  input: PlaceOrderInput,
  provider: string
): Promise<CreatePendingOrderResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('create_pending_order', {
    p_provider: provider,
    p_shipping_name: input.shippingName ?? '',
    p_shipping_phone: input.shippingPhone ?? '',
    p_shipping_city: input.shippingCity ?? '',
    p_shipping_street: input.shippingStreet ?? '',
    p_shipping_building: input.shippingBuilding ?? '',
    p_shipping_postal_code: input.shippingPostalCode ?? '',
    p_email: input.email ?? '',
    p_gift_cards: input.giftCards ?? [],
  })

  if (error) {
    return { status: 'error', reason: 'unknown', message: error.message }
  }

  const payload = data as RpcPayload
  if (payload.status === 'ok') {
    return {
      status: 'ok',
      orderId: payload.orderId,
      finalTotal: payload.finalTotal,
      giftCardTotalApplied: payload.giftCardTotalApplied ?? 0,
      amountDue: payload.amountDue ?? payload.finalTotal,
      recurring: payload.recurring ?? false,
      recurringAmount: payload.recurringAmount ?? 0,
    }
  }
  return { status: 'error', reason: payload.reason }
}
