import { z } from 'zod'

const sortSchema = z
  .enum(['year-desc', 'year-asc', 'author-asc', 'author-desc', 'price-asc', 'price-desc'])
  .catch('year-desc')
const positiveNumberSchema = z.preprocess((value) => {
  if (typeof value !== 'string' || value.trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}, z.number().nullable())
const positiveIntegerSchema = (fallback: number) =>
  z.preprocess((value) => {
    if (typeof value !== 'string') return fallback
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
  }, z.number().int().positive())

const stringArraySchema = z.preprocess((value) => {
  const rawValues = Array.isArray(value) ? value : [value]

  return rawValues
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
}, z.array(z.string()))

const categoryArraySchema = z.preprocess((value) => {
  const rawValues = Array.isArray(value) ? value : [value]

  return rawValues
    .filter((item): item is string => typeof item === 'string' && item !== 'all')
    .map((item) => item.trim())
    .filter(Boolean)
}, z.array(z.string()))

const legacySortMap: Record<string, z.infer<typeof sortSchema>> = {
  newest: 'year-desc',
  title: 'author-asc',
}

export const normalizedSortSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return 'year-desc'
  return legacySortMap[value] ?? value
}, sortSchema)

export const bookFiltersSearchParamsSchema = z.object({
  q: z.string().trim().catch(''),
  type: categoryArraySchema.catch([]),
  category: categoryArraySchema.catch([]),
  author: stringArraySchema.catch([]),
  year: stringArraySchema.catch([]),
  priceFrom: positiveNumberSchema.catch(null),
  priceTo: positiveNumberSchema.catch(null),
  sort: normalizedSortSchema,
  page: positiveIntegerSchema(1).catch(1),
  limit: positiveIntegerSchema(12).catch(12),
})
