'use server'

import { createClient } from '@/lib/supabase/server'

export type RedeemGiftCardResult =
  | { status: 'ok'; cardId: string }
  | { status: 'error'; message: string }

export async function redeemGiftCardToken(token: string): Promise<RedeemGiftCardResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_gift_card_token', { p_token: token })

  if (error) {
    return { status: 'error', message: error.message }
  }

  if (!data) {
    return { status: 'error', message: 'Ссылка недействительна или уже использована.' }
  }

  return { status: 'ok', cardId: data }
}
