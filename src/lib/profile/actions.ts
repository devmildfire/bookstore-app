'use server'

// Server-only imports must come from each module directly, not the
// public barrel — see src/api/profile/index.ts. The barrel can't
// re-export updateProfile / setRecoveryEmail without leaking
// next/headers into any client bundle that imports from @/api/profile.
import { updateProfile, type UpdateProfileInput } from '@/api/profile/updateProfile'
import { setRecoveryEmail, type SetRecoveryEmailResult } from '@/api/profile/setRecoveryEmail'
import { getProfileServer } from '@/api/profile/getProfileServer'
import type { Profile } from '@/entities/profile/client'

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

// Google OAuth lives in src/app/api/auth/google/route.ts as a plain GET
// → 302 redirect, NOT a Server Action. The old action shape (return URL,
// have the client navigate) raced Firefox's RSC stream reader and
// surfaced "Uncaught TypeError: Error in input stream" mid-flight. A
// top-level navigation to a Route Handler has no streaming response to
// abort. See docs/plans/auth-flow.md.
