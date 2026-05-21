import { createClient } from '@/lib/supabase/server'
import { normalizeProfile } from '@/entities/profile/normalize'
import type { Profile } from '@/entities/profile/client'
import type { ProfileServerRow } from '@/entities/profile/server'

// Server-only fetch (Server Components inside /profile route tree).
// Returns null if the user isn't authenticated yet — caller decides what
// to render. Uses cookie-bound Supabase client so RLS scopes correctly.
export async function getProfileServer(): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_or_create_profile')
  if (error) {
    // 'not_authenticated' from the RPC raises a PG exception; the user has
    // no session — let the page render its no-session state instead of
    // surfacing a 500.
    return null
  }
  return normalizeProfile(data as ProfileServerRow)
}
