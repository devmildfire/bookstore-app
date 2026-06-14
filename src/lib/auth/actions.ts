'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthError = { error: string }

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
})

export async function loginAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, password } = parsed.data
  const supabase = await createClient()

  // Capture anonymous session before it is replaced by signInWithPassword
  const { data: { user: prevUser } } = await supabase.auth.getUser()
  const anonId = prevUser?.is_anonymous ? prevUser.id : null

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  // Best-effort — login must not fail if migration errors — but the failure is
  // captured and logged (never silently swallowed): the anon user's cart/orders
  // stay intact under the anon UID and can be re-migrated on a later sign-in.
  if (anonId) {
    const result = await migrateAnonymousUserAction(anonId)
    if (!result.ok) {
      console.error(`[loginAction] anon migration failed (from=${anonId}):`, result.error)
    }
  }

  redirect('/profile')
}

export async function registerAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const parsed = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { email, password } = parsed.data
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.is_anonymous) {
    // Upgrade in-place — keeps same UID so the cart survives without migration.
    // With email confirmations on, this triggers an `email_change` confirmation
    // to the new address; the anon session persists (soft gate) and the email
    // stays pending in user.new_email until the link is clicked. Land them in
    // the cabinet, where EmailConfirmBanner prompts them to confirm.
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) return { error: error.message }
    redirect('/profile')
  } else {
    // Fresh signup with confirmations on returns NO session — the account is
    // unusable until confirmed. Send them to the check-your-email screen.
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    redirect('/auth/login?check_email=1')
  }
}

// Resend the pending email confirmation for the current user. Picks the right
// OTP type from the user's state: a pending email change (anon→account upgrade)
// uses `email_change`; an unconfirmed fresh account uses `signup`.
export async function resendEmailConfirmationAction(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Сессия не найдена' }

  const pendingEmail = user.new_email ?? user.email
  if (!pendingEmail) return { ok: false, error: 'Нет адреса для подтверждения' }

  const type = user.new_email ? 'email_change' : 'signup'
  const { error } = await supabase.auth.resend({ type, email: pendingEmail })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Moves an anonymous user's cart + orders onto the authenticated caller,
// then deletes the anon row. Calls migrate_anonymous_user SECURITY DEFINER
// (in the consolidated baseline schema). Same RPC used by /auth/callback for the
// Google OAuth hand-off, so email/password and Google login behave the same.
//
// Returns a typed result instead of throwing/swallowing — the caller decides
// whether to block (it doesn't) but the error is always surfaced to logs. The
// RPC is transactional: on failure nothing is migrated and the anon row is left
// intact, so a later sign-in can retry.
export async function migrateAnonymousUserAction(
  fromUserId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'not_authenticated' }

  const { error } = await supabase.rpc('migrate_anonymous_user', {
    from_user_id: fromUserId,
    to_user_id: user.id,
  })
  if (error) {
    console.error(
      `[migrateAnonymousUserAction] migrate_anonymous_user failed (from=${fromUserId} to=${user.id}):`,
      error.message,
    )
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

const forgotSchema = z.object({ email: z.string().email('Введите корректный email') })

// Sends the password-recovery email (rendered by the Send-Email hook). Always
// reports success — never reveal whether an address has an account. The email
// link lands on /auth/confirm (type=recovery) → /auth/reset-password.
export async function requestPasswordResetAction(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const parsed = forgotSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
  })
  return { ok: true }
}

const resetSchema = z.object({
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
})

// Sets a new password for the recovery session established by /auth/confirm.
export async function updatePasswordAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const parsed = resetSchema.safeParse({ password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password })
  if (error) {
    // GoTrue messages are English; surface a Russian message to the user.
    const samePassword =
      error.code === 'same_password' || /different from the old/i.test(error.message)
    return {
      error: samePassword
        ? 'Новый пароль должен отличаться от текущего.'
        : 'Не удалось сохранить пароль. Откройте ссылку из письма ещё раз и попробуйте снова.',
    }
  }

  redirect('/profile')
}
