export type BoxSetBook = {
  titleId: number
  slug: string
  name: string
  coverUrl: string | null
  authorName: string
  position: number
}

export type BoxSet = {
  id: number
  cartId: string
  slug: string
  name: string
  description: string | null
  price: number
  discount: number | null
  originalPrice: number | null
  imageUrl: string | null
  position: number
  publishedAt: string | null
}
