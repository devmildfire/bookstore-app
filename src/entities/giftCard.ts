import { getGiftCardImageUrl } from '@/lib/storage'
import type { Database } from '@/types/supabase'

export type GiftCardRow = Database['public']['Tables']['GiftCards']['Row'] & {
  GiftCardProducts: Database['public']['Tables']['GiftCardProducts']['Row'] | null
}

export type GiftCardStatus = 'active' | 'pending' | 'depleted'

export type GiftCard = {
  id: string
  code: string
  productId: number
  productName: string
  productImageUrl: string | null
  faceValue: number
  balance: number
  status: GiftCardStatus
  claimToken: string | null
  recipientEmail: string | null
  sentAt: string | null
  orderId: number | null
  createdAt: string
}

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
    productImageUrl: getGiftCardImageUrl(product?.image_path ?? null),
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
