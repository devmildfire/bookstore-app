import { createClient } from '@/lib/supabase/client'
import { normalizeProfile } from '@/entities/profile/normalize'
import type { Profile } from '@/entities/profile/client'
import type { ProfileServerRow } from '@/entities/profile/server'

export const profileQueryKey = ['profile'] as const

// Browser-side fetch: calls the lazy-create RPC and normalizes.
export async function getProfile(): Promise<Profile> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_or_create_profile')
  if (error) {
    throw new Error(`Не удалось загрузить профиль: ${error.message}`)
  }
  return normalizeProfile(data as ProfileServerRow)
}
