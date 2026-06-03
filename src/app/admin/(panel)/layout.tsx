import { requireAdmin } from '@/lib/admin/auth'
import { adminLogoutAction } from '@/lib/admin/actions'
import AdminSideNav from '@/components/admin/AdminSideNav'
import styles from './layout.module.scss'

// Guarded admin chrome. requireAdmin() is defense-in-depth alongside the proxy
// gate. /admin/login lives OUTSIDE this (panel) group, so it isn't guarded.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin()

  return (
    <div className={styles.shell}>
      <AdminSideNav />
      <div className={styles.body}>
        <header className={styles.topbar}>
          <span className={styles.crumb}>Админ-панель</span>
          <div className={styles.account}>
            <span className={styles.email}>{user.email}</span>
            <form action={adminLogoutAction}>
              <button type='submit' className={styles.logout}>
                Выйти
              </button>
            </form>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
