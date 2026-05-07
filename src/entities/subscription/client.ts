export type Subscription = {
  id: number
  cartId: string
  slug: string
  name: string
  description: string | null
  perks: string[]
  price: number
  discount: number | null
  originalPrice: number | null
  imageUrl: string | null
  position: number
  publishedAt: string | null
}
