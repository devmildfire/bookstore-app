import type { User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Admin role lives in auth.users.app_metadata.role — set only via service-role
// SQL (see docs/plans/admin-panel.md §9). app_metadata is not user-editable and
// rides in the JWT, so the proxy and server can trust it without a DB lookup.
export const ADMIN_ROLE = 'admin'

export function isAdmin(user: User | null | undefined): boolean {
  if (!user) return false
  const role = (user.app_metadata as { role?: unknown } | undefined)?.role
  return role === ADMIN_ROLE
}

// Resolve the current session's user (server side). Null when signed out.
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Guard for admin Server Components, layouts, and Server Actions. Redirects
// non-admins to /admin/login. Defense-in-depth alongside the proxy gate.
// Returns the verified admin user.
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!isAdmin(user)) redirect('/admin/login')
  return user as User
}
