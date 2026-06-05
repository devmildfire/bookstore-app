import { requireAdmin } from '@/lib/admin/auth'
import AdminShell from '@/components/admin/AdminShell'

// Guarded admin chrome. requireAdmin() is defense-in-depth alongside the proxy
// gate. /admin/login lives OUTSIDE this (panel) group, so it isn't guarded.
// The chrome (sidebar + topbar + mobile drawer) lives in the client AdminShell;
// children stay server-rendered and are passed through as a prop.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()
  return <AdminShell userEmail={user.email ?? null}>{children}</AdminShell>
}
