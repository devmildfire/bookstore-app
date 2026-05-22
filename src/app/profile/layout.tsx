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
  city: null,
  about: null,
  recoveryEmail: null,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = (await getProfileServer()) ?? FALLBACK_PROFILE
  // Read isAnonymous server-side: with `encode: 'tokens-only'` the browser
  // client can't see the HttpOnly tokens, so a client-side hook would show
  // stale state after OAuth completes server-side.
  const isAnon = !user || user.is_anonymous === true
  const userEmail = (!isAnon && user?.email) || null
  const provider =
    (!isAnon && (user?.app_metadata?.provider as string | undefined)) || null

  return (
    <ProfileProvider initialProfile={profile}>
      <div className={styles.page}>
        <ProfileSideNav isAnon={isAnon} userEmail={userEmail} provider={provider} />
        <div className={styles.rightColumn}>
          <header className={styles.header}>
            <h1 className={styles.title}>ЛИЧНЫЙ КАБИНЕТ</h1>
          </header>
          <main className={styles.main}>{children}</main>
        </div>
      </div>
    </ProfileProvider>
  )
}
