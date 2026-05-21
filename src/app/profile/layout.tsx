import { redirect } from 'next/navigation'
import { getProfileServer } from '@/api/profile/getProfileServer'
import { createClient } from '@/lib/supabase/server'
import { ProfileProvider } from '@/contexts/profile'
import ProfileSideNav from '@/components/profile/ProfileSideNav'
import styles from './layout.module.scss'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('[profile/layout] user', {
    id: user?.id ?? null,
    isAnon: user?.is_anonymous ?? null,
    email: user?.email ?? null,
  })

  // No session at all — the layout shell needs *some* user_id to anchor
  // RLS-scoped reads. Send to /books and let providers.tsx anon-signin
  // catch up on the next visit.
  if (!user) {
    redirect('/books')
  }

  const profile = await getProfileServer()
  console.log('[profile/layout] profile', profile === null ? 'NULL' : `loaded (nickname=${profile.nickname})`)
  if (!profile) {
    redirect('/books')
  }

  const isAnon = user.is_anonymous === true
  const userEmail = user.email ?? null

  return (
    <ProfileProvider initialProfile={profile}>
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>ЛИЧНЫЙ КАБИНЕТ</h1>
        </header>

        <div className={styles.body}>
          <aside className={styles.nav}>
            <ProfileSideNav
              nickname={profile.nickname}
              isAnon={isAnon}
              userEmail={userEmail}
            />
          </aside>
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </ProfileProvider>
  )
}
