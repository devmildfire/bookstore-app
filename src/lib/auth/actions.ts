'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthError = { error: string }
type RpcFn = (name: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>

export async function loginAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  // Capture anonymous session before it is replaced by signInWithPassword
  const { data: { user: prevUser } } = await supabase.auth.getUser()
  const anonId = prevUser?.is_anonymous ? prevUser.id : null

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  // Best-effort cart migration — login must not fail if this errors
  if (anonId) {
    await migrateCartAction(anonId).catch(() => {})
  }

  redirect('/account')
}

export async function registerAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

// Moves anonymous cart items to the authenticated user's cart.
// Calls the migrate_cart SECURITY DEFINER function (migration 20260505100000).
export async function migrateCartAction(fromUserId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return

  await (supabase.rpc as unknown as RpcFn)('migrate_cart', {
    from_user_id: fromUserId,
    to_user_id: user.id,
  })
}
