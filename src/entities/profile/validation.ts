import { z } from 'zod'

const phoneRegex = /^[+()\d\s-]{10,20}$/

// Empty string ↔ null helpers — keep optional fields simple to bind to forms.
function optionalTrimmed(max: number, message?: string) {
  return z
    .string()
    .trim()
    .max(max, message)
    .transform((v) => (v === '' ? null : v))
    .nullable()
}

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || z.string().email().safeParse(v).success, {
    message: 'Введите корректный email',
  })

const optionalPhone = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || phoneRegex.test(v), {
    message: 'Введите корректный телефон',
  })

const optionalBirthday = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), {
    message: 'Введите дату в формате ГГГГ-ММ-ДД',
  })

export const profileEditSchema = z.object({
  nickname: z.string().trim().min(1, 'Введите никнейм').max(50, 'Не более 50 символов'),
  fullName: optionalTrimmed(150, 'Не более 150 символов'),
  phone: optionalPhone,
  birthday: optionalBirthday,
  about: optionalTrimmed(1000, 'Не более 1000 символов'),
})

export type ProfileEditValues = z.infer<typeof profileEditSchema>

export const recoveryEmailSchema = z.object({
  email: optionalEmail.refine((v) => v !== null, { message: 'Введите email' }),
})

export type RecoveryEmailValues = z.infer<typeof recoveryEmailSchema>

// File constraints for avatar uploads.
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024 // 2 MiB
export const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number]
