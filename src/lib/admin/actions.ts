'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin/auth'

type AdminAuthError = { error: string } | null

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})

// Email+password only — no OAuth, no anonymous. On success the signed-in user
// must carry the admin role, otherwise we sign them back out and refuse.
export async function adminLoginAction(_prev: AdminAuthError, formData: FormData): Promise<AdminAuthError> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { error: 'Неверный email или пароль.' }

  if (!isAdmin(data.user)) {
    await supabase.auth.signOut()
    return { error: 'У этого аккаунта нет доступа к админ-панели.' }
  }

  redirect('/admin')
}

export async function adminLogoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
