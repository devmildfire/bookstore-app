import { requireAdmin } from '@/lib/admin/auth'
import { getAdminNavCounts } from '@/api/admin/dashboard'
import AdminShell from '@/components/admin/AdminShell'

// The admin panel is auth-gated and per-request — never prerender it at build. This is
// REQUIRED, not cosmetic: getAdminNavCounts() (below) uses the service-role client, whose
// key (SUPABASE_SERVICE_ROLE_KEY) is server-only and absent from the CI/build env. Without
// this, the build's prerender pass executes this layout and throws "supabaseKey is required".
// (Before the root layout went auth-free, its cookies() read bailed admin routes dynamic
// before this ran; force-dynamic makes that intent explicit and build-safe.)
export const dynamic = 'force-dynamic'

// Guarded admin chrome. requireAdmin() is defense-in-depth alongside the proxy
// gate. /admin/login lives OUTSIDE this (panel) group, so it isn't guarded.
// The chrome (sidebar + topbar + mobile drawer) lives in the client AdminShell;
// children stay server-rendered and are passed through as a prop.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [user, navCounts] = await Promise.all([requireAdmin(), getAdminNavCounts()])
  return (
    <AdminShell userEmail={user.email ?? null} navCounts={navCounts}>
      {children}
    </AdminShell>
  )
}
