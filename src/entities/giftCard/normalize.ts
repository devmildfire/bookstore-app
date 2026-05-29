import type { GiftCard, GiftCardStatus } from './client'
import type { GiftCardRow } from './server'

function normalizeStatus(status: string): GiftCardStatus {
  if (status === 'pending' || status === 'depleted') return status
  return 'active'
}

export function normalizeGiftCard(raw: GiftCardRow): GiftCard {
  const product = raw.GiftCardProducts

  return {
    id: raw.id,
    code: raw.code,
    productId: raw.product_id,
    productName: product?.name ?? 'Карта даров',
    faceValue: product?.face_value ?? raw.initial_value,
    balance: raw.balance,
    status: normalizeStatus(raw.status),
    claimToken: raw.claim_token,
    recipientEmail: raw.pending_recipient_email,
    sentAt: raw.sent_at,
    orderId: raw.order_id,
    createdAt: raw.created_at,
  }
}
