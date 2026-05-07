import { z } from 'zod'

export const boxSetSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number().nonnegative(),
  discount: z.number().nullable(),
  image: z.string().nullable(),
  position: z.number(),
  is_active: z.boolean(),
  is_published: z.boolean(),
  publish_date: z.string().nullable(),
})

export type BoxSetInput = z.infer<typeof boxSetSchema>
