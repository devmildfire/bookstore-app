import { createClient } from '@/lib/supabase/server'
import { normalizeProfile } from '@/entities/profile/normalize'
import type { Profile } from '@/entities/profile/client'
import type { ProfileServerRow, ProfileUpdate } from '@/entities/profile/server'

export type UpdateProfileInput = {
  nickname?: string
  fullName?: string | null
  phone?: string | null
  birthday?: string | null
  city?: string | null
  about?: string | null
  avatarPath?: string | null
  recoveryEmail?: string | null
}

// Server-side UPDATE — called only from Server Actions (updateProfileAction
// + setRecoveryEmail). The browser client would crash here ("window is not
// defined") because Server Action context has no window. RLS still scopes
// the row to auth.uid() via the server-side session cookies.
export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Нет авторизации')
  }

  const patch: ProfileUpdate = {}
  if (input.nickname !== undefined) patch.nickname = input.nickname
  if (input.fullName !== undefined) patch.full_name = input.fullName
  if (input.phone !== undefined) patch.phone = input.phone
  if (input.birthday !== undefined) patch.birthday = input.birthday
  if (input.city !== undefined) patch.city = input.city
  if (input.about !== undefined) patch.about = input.about
  if (input.avatarPath !== undefined) patch.avatar_path = input.avatarPath
  if (input.recoveryEmail !== undefined) patch.recovery_email = input.recoveryEmail

  const { data, error } = await supabase
    .from('Profiles')
    .update(patch)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error || !data) {
    throw new Error(`Не удалось обновить профиль: ${error?.message ?? 'нет данных'}`)
  }
  return normalizeProfile(data as ProfileServerRow)
}
