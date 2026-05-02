export type Order = {
  id: number
  userId: string | null
  status: string
  total: number
  deliveryMethod: string | null
  deliveryEmail: string | null
  createdAt: string
  items: OrderItem[]
}

export type OrderItem = {
  id: number
  orderId: number
  bookId: string
  name: string
  price: number
  quantity: number
  category: string | null
}
