import { z } from 'zod'

// Russian phone: +7, parens, spaces, dashes allowed; 10-20 chars after trim.
const phoneRegex = /^[+()\d\s-]{10,20}$/
// Russian Post 6-digit postal code.
const postalCodeRegex = /^\d{6}$/

// Optional email helper — empty string treated as "not provided".
const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || z.string().email().safeParse(v).success, {
    message: 'Введите корректный email',
  })

export const shippingSchema = z.object({
  name: z.string().trim().min(2, 'Введите имя и фамилию').max(100),
  phone: z.string().trim().regex(phoneRegex, 'Введите корректный телефон'),
  email: optionalEmail,
  city: z.string().trim().min(2, 'Введите город').max(100),
  street: z.string().trim().min(2, 'Введите улицу').max(200),
  building: z.string().trim().min(1, 'Введите дом / квартиру').max(50),
  postalCode: z.string().trim().regex(postalCodeRegex, 'Введите 6-значный индекс'),
})

export const emailOnlySchema = z.object({
  email: optionalEmail,
})

export type ShippingFormValues = z.infer<typeof shippingSchema>
export type EmailOnlyFormValues = z.infer<typeof emailOnlySchema>
