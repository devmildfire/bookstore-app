import { updateProfile } from './updateProfile'
import type { Profile } from '@/entities/profile/client'

export type SetRecoveryEmailResult =
  | { status: 'ok'; profile: Profile }
  | { status: 'error'; message: string }

// Stores email on Profiles.recovery_email. No verification, no Supabase auth
// confirmation — opt-in only. Future registration flow looks this up to bind
// an existing anonymous user to a new real account.
export async function setRecoveryEmail(email: string | null): Promise<SetRecoveryEmailResult> {
  try {
    const profile = await updateProfile({ recoveryEmail: email })
    return { status: 'ok', profile }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Ошибка'
    return { status: 'error', message }
  }
}
