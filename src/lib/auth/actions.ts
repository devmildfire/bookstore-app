'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthError = { error: string }
type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

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

  // Best-effort — login must not fail if migration errors
  if (anonId) {
    await migrateAnonymousUserAction(anonId).catch(() => {})
  }

  redirect('/account')
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
    // Upgrade in-place — keeps same UID so the cart survives without migration
    const { error } = await supabase.auth.updateUser({ email, password })
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
  }

  redirect('/auth/login?registered=true')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Moves an anonymous user's cart + orders onto the authenticated caller,
// then deletes the anon row. Calls migrate_anonymous_user SECURITY DEFINER
// (migration 20260521130000). Same RPC used by /auth/callback for the
// Google OAuth hand-off, so email/password and Google login behave the same.
export async function migrateAnonymousUserAction(fromUserId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return

  await (supabase.rpc as unknown as RpcFn)('migrate_anonymous_user', {
    from_user_id: fromUserId,
    to_user_id: user.id,
  })
}
