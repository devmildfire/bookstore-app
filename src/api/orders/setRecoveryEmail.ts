import { createClient } from '@/lib/supabase/server'

export type SetRecoveryEmailResult =
  | { status: 'ok' }
  | { status: 'error'; message: string }

// Stores a "recovery email" in the user's auth metadata. Real registration is
// out of scope; later flow will pick this up to bind the email to the user.
//
// We deliberately do NOT call `supabase.auth.updateUser({ email })` here —
// that would trigger Supabase's confirmation flow, which requires real SMTP
// and would lock the anonymous account into the half-confirmed state.
export async function setRecoveryEmail(email: string): Promise<SetRecoveryEmailResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.updateUser({
    data: { recovery_email: email },
  })
  if (error || !data.user) {
    return { status: 'error', message: error?.message ?? 'Не удалось сохранить email' }
  }
  return { status: 'ok' }
}
