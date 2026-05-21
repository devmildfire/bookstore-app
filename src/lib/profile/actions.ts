'use server'

import { cookies } from 'next/headers'
import { updateProfile, setRecoveryEmail } from '@/api/profile'
import { getProfileServer } from '@/api/profile/getProfileServer'
import { createClient } from '@/lib/supabase/server'
import { PENDING_ANON_COOKIE } from '@/lib/profile/constants'
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

// Starts a Google OAuth round-trip via Supabase and returns the URL the
// client should redirect to. /auth/callback runs the PKCE exchange server-
// side so session cookies are written HTTP-only on the app origin.
//
// If the current session is anonymous, we stash the anon UID in a short-
// lived cookie before the redirect. After the OAuth round-trip /auth/callback
// reads it and calls migrate_anonymous_user(anon, new) so the anon's cart
// and orders end up on whatever user GoTrue resolved Google to — whether
// that's a brand-new user (signup) or an existing one (returning user on a
// new device). See docs/conventions/DATA.md and the migration file.
//
// We do NOT use linkIdentity: it can't link to a Google identity that's
// already attached to another auth.users row, which traps the multi-device
// returning-user case (their anon session has no password to fall back to).
export async function signInWithGoogleAction(redirectOrigin: string): Promise<GoogleOAuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectOrigin}/auth/callback?next=/profile`,
      skipBrowserRedirect: true,
    },
  })
  if (error || !data?.url) {
    return { status: 'error', message: error?.message ?? 'Google OAuth не настроен' }
  }

  if (user?.is_anonymous) {
    const cookieStore = await cookies()
    cookieStore.set(PENDING_ANON_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 600, // 10 min — covers the OAuth round-trip with plenty of slack
    })
  }

  return { status: 'ok', url: data.url }
}
