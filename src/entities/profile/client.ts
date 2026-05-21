export type Profile = {
  userId: string
  nickname: string
  avatarPath: string | null
  fullName: string | null
  phone: string | null
  birthday: string | null     // ISO date 'YYYY-MM-DD' or null
  city: string | null
  about: string | null
  recoveryEmail: string | null
  createdAt: string
  updatedAt: string
}
