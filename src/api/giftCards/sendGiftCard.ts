'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type SendGiftCardResult =
  | { status: 'ok'; claimUrl: string; claimToken: string }
  | { status: 'error'; message: string }

export async function sendGiftCard(cardId: string, recipientEmail: string | null): Promise<SendGiftCardResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('send_gift_card', {
    p_card_id: cardId,
    p_recipient_email: recipientEmail ?? '',
  })

  if (error || !data) {
    return { status: 'error', message: error?.message ?? 'Не удалось создать ссылку' }
  }

  const headerStore = await headers()
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? ''
  const proto = headerStore.get('x-forwarded-proto') ?? 'http'
  const origin = host ? `${proto}://${host}` : ''
  const claimUrl = `${origin}/redeem/${data}`

  return { status: 'ok', claimToken: data, claimUrl }
}
