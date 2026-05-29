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
