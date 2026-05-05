'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthError = { error: string }

export async function loginAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  redirect('/account')
}

export async function registerAction(_prev: AuthError | null, formData: FormData): Promise<AuthError | null> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  redirect('/auth/login?registered=true')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Intentional stub — blocked by two unresolved dependencies:
// 1. C6: Cart table has no user_id column; RLS policy is unverified/undocumented.
//    Cannot write UPDATE Cart SET … WHERE user_id = old_uid without that column.
// 2. Register path should use supabase.auth.updateUser({ email, password }) to upgrade
//    the anonymous user in-place (keeps same UID → cart survives without migration).
//    Login path requires a SECURITY DEFINER DB function once C6 is resolved.
export async function migrateCartAction(_cartId: string): Promise<AuthError | void> {}
