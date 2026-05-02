'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type AuthError = { error: string }

export async function loginAction(formData: FormData): Promise<AuthError | void> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/account')
}

export async function registerAction(formData: FormData): Promise<AuthError | void> {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  redirect('/account')
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// Called after login/register to transfer cart items from the anonymous cookie cart
// to the newly authenticated user's session. Implemented in Phase 7.
export async function migrateCartAction(_cartId: string): Promise<AuthError | void> {
  // Phase 7: update Cart rows where id = cartId to attach to the authenticated user
}
