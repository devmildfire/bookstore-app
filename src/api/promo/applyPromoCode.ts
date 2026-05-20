import { createClient } from '@/lib/supabase/client'
import { promoCodeInputSchema } from '@/entities/promo/validation'
import { normalizeAppliedPromo } from '@/entities/promo/normalize'
import type { AppliedPromo } from '@/entities/promo/client'
import type { PromoCodeServerRow } from '@/entities/promo/server'

export type ApplyPromoErrorReason =
  | 'invalid_input'
  | 'not_authenticated'
  | 'not_found'
  | 'inactive'
  | 'target_missing'

export type ApplyPromoResult =
  | { status: 'ok'; applied: AppliedPromo }
  | { status: 'error'; reason: ApplyPromoErrorReason; targetName?: string }

type RpcOkPayload = {
  status: 'ok'
  applied: PromoCodeServerRow & { applied_at: string }
}

type RpcErrorPayload = {
  status: 'error'
  reason: ApplyPromoErrorReason
  targetName?: string
}

type RpcPayload = RpcOkPayload | RpcErrorPayload

export async function applyPromoCode(rawInput: string): Promise<ApplyPromoResult> {
  const parsed = promoCodeInputSchema.safeParse(rawInput)
  if (!parsed.success) {
    return { status: 'error', reason: 'invalid_input' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc('apply_promo_code', { input_code: parsed.data })

  if (error) {
    throw new Error(`Не удалось применить промокод: ${error.message}`)
  }

  const payload = data as RpcPayload

  if (payload.status === 'ok') {
    const { applied_at, ...row } = payload.applied
    return { status: 'ok', applied: normalizeAppliedPromo(row as PromoCodeServerRow, applied_at) }
  }

  return { status: 'error', reason: payload.reason, targetName: payload.targetName }
}
