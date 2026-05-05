import { z } from 'zod'

export const addToCartSchema = z.object({
  id: z.string().min(1, 'ID книги обязателен'),
  name: z.string().min(1, 'Название книги обязательно'),
  subtitle: z.string().nullable().optional(),
  price: z.number().min(0, 'Цена должна быть положительной'),
  picture: z.string().nullable().optional(),
  category: z.enum(['PrintBook', 'AudioBook', 'EBook', 'Book2.0', 'GiftCard', 'BoxSet', 'Subscription', 'Course']),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
