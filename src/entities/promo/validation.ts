import { z } from 'zod'

// Promo code input: trimmed, upper-cased, length 1-64.
// Stored in DB as upper-case; comparison uses UPPER() on the DB side.
export const promoCodeInputSchema = z
  .string()
  .trim()
  .min(1, 'Введите промокод')
  .max(64, 'Слишком длинный промокод')
  .transform((value) => value.toUpperCase())

export type PromoCodeInput = z.infer<typeof promoCodeInputSchema>
