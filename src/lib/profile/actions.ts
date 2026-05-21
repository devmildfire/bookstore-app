'use server'

import { updateProfile, setRecoveryEmail } from '@/api/profile'
import { getProfileServer } from '@/api/profile/getProfileServer'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/entities/profile/client'
import type { UpdateProfileInput, SetRecoveryEmailResult } from '@/api/profile'

export type ProfileActionResult =
  | { status: 'ok'; profile: Profile }
  | { status: 'error'; message: string }

export async function getOrCreateProfileAction(): Promise<Profile | null> {
  return getProfileServer()
}

export async function updateProfileAction(input: UpdateProfileInput): Promise<ProfileActionResult> {
  try {
    const profile = await updateProfile(input)
    return { status: 'ok', profile }
  } catch (e) {
    return { status: 'error', message: e instanceof Error ? e.message : 'Ошибка' }
  }
}

export async function setRecoveryEmailAction(email: string): Promise<SetRecoveryEmailResult> {
  const trimmed = email.trim()
  if (!trimmed) {
    return { status: 'error', message: 'Введите email' }
  }
  return setRecoveryEmail(trimmed)
}

export type GoogleOAuthResult =
  | { status: 'ok'; url: string }
  | { status: 'error'; message: string }

// Starts a real Google OAuth round-trip via Supabase. Returns the URL the
// client should redirect to. Requires Google to be enabled as a Supabase
// auth provider — see docs/plans/anonymous-first-profile.md § Setup.
export async function signInWithGoogleAction(redirectOrigin: string): Promise<GoogleOAuthResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${redirectOrigin}/profile`, skipBrowserRedirect: true },
  })
  if (error || !data?.url) {
    return { status: 'error', message: error?.message ?? 'Google OAuth не настроен' }
  }
  return { status: 'ok', url: data.url }
}
