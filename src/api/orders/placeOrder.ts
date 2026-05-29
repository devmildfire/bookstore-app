import { createClient } from '@/lib/supabase/server'

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

export type PlaceOrderResult =
  | { status: 'ok'; orderId: number; finalTotal: number; giftCardTotalApplied: number; amountDue: number }
  | { status: 'error'; reason: PlaceOrderErrorReason; message?: string }

type RpcPayload =
  | {
      status: 'ok'
      orderId: number
      finalTotal: number
      giftCardTotalApplied?: number
      amountDue?: number
    }
  | { status: 'error'; reason: PlaceOrderErrorReason }

// Server-side only — uses the cookie-bound Supabase client. Re-validates and
// re-prices the cart inside the place_order RPC; never trusts the input
// beyond shipping/email strings.
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('place_order', {
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
    }
  }
  return { status: 'error', reason: payload.reason }
}
