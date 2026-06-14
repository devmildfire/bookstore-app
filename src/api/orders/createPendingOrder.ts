import { createClient } from '@/lib/supabase/server'

// Shipping/email input for a checkout. The RPC re-prices the cart server-side and
// never trusts these beyond the raw strings.
export type PlaceOrderInput = {
  shippingName: string | null
  shippingPhone: string | null
  shippingCity: string | null
  shippingStreet: string | null
  shippingBuilding: string | null
  shippingPostalCode: string | null
  email: string | null
  giftCards?: Array<{ id: string; amount: number }>
}

export type PlaceOrderErrorReason =
  | 'not_authenticated'
  | 'empty_cart'
  | 'invalid_gift_cards'
  | 'gift_card_over_limit'
  | 'unknown'

// Creates a `pending` order (price snapshot + reserved gift cards) WITHOUT
// taking payment or wiping the cart. The returned amountDue is what the gateway
// must charge; recurring marks a subscription anchor. Settlement happens later
// via mark_order_paid (the verified ResultURL webhook). The create_pending_order
// RPC re-prices the cart server-side — input is never trusted beyond
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
