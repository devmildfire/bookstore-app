export type BoxSetBook = {
  titleId: number
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
  // Inline SVG markup when the image is an SVG (fetched from storage); null for
  // raster images, which render via imageUrl instead.
  imageSvg: string | null
  position: number
  publishedAt: string | null
}
