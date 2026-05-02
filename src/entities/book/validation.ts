import { z } from 'zod'

const sortSchema = z.enum(['newest', 'price-asc', 'price-desc', 'title']).catch('newest')
const positiveNumberSchema = z.preprocess((value) => {
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}, z.number().nullable())
const pageSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return 1
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1
}, z.number().int().positive())

export const bookFiltersSearchParamsSchema = z.object({
  q: z.string().trim().catch(''),
  category: z.string().trim().catch('all'),
  author: z.string().trim().catch(''),
  priceFrom: positiveNumberSchema.catch(null),
  priceTo: positiveNumberSchema.catch(null),
  sort: sortSchema,
  page: pageSchema.catch(1),
})
