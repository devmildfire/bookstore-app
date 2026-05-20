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

// Optional name: empty allowed; otherwise trimmed length 2-100.
const optionalName = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || (v.length >= 2 && v.length <= 100), {
    message: 'От 2 до 100 символов',
  })

// Optional phone: empty allowed; otherwise must match Russian phone format.
const optionalPhone = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || phoneRegex.test(v), {
    message: 'Введите корректный телефон',
  })

// Only address fields are required for physical delivery. Name, phone, email
// are accepted but optional — the buyer might want delivery without divulging
// any of those.
export const shippingSchema = z.object({
  name: optionalName,
  phone: optionalPhone,
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
