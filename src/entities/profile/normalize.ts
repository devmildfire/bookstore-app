import type { Profile } from './client'
import type { ProfileServerRow } from './server'

export function normalizeProfile(raw: ProfileServerRow): Profile {
  return {
    userId: raw.user_id,
    nickname: raw.nickname,
    avatarPath: raw.avatar_path,
    fullName: raw.full_name,
    phone: raw.phone,
    birthday: raw.birthday,
    about: raw.about,
    recoveryEmail: raw.recovery_email,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}
