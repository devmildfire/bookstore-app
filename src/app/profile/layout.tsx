import { getProfileServer } from '@/api/profile/getProfileServer'
import { createClient } from '@/lib/supabase/server'
import { ProfileProvider } from '@/contexts/profile'
import ProfileSideNav from '@/components/profile/ProfileSideNav'
import type { Profile } from '@/entities/profile/client'
import styles from './layout.module.scss'

// Fallback profile when no session/profile exists — keeps the cabinet shell
// renderable even during the auth-in-flight window after OAuth.
const FALLBACK_PROFILE: Profile = {
  userId: '',
  nickname: 'Никнейм',
  avatarPath: null,
  fullName: null,
  phone: null,
  birthday: null,
  about: null,
  recoveryEmail: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = (await getProfileServer()) ?? FALLBACK_PROFILE

  const isAnon = user?.is_anonymous === true || !user
  const userEmail = user?.email ?? null

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
