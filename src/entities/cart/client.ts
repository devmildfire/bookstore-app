import type { ProductCategory } from '@/types/database'

export type CartItem = {
  id: string
  name: string
  subtitle: string | null
  price: number
  quantity: number
  picture: string | null
  discount: number | null
  category: ProductCategory
}

export type CartState = {
  items: CartItem[]
  total: number
  itemCount: number
}
