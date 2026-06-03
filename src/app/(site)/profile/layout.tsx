import { getProfileServer } from '@/api/profile/getProfileServer'
import { createClient } from '@/lib/supabase/server'
import { ProfileProvider } from '@/contexts/profile'
import ProfileSideNav from '@/components/profile/ProfileSideNav'
import ProfileAuthSlot from '@/components/profile/ProfileAuthSlot'
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
  // user.app_metadata.provider tracks the *initial* signup method, not the
  // current session's. For an account created via email and later linked
  // to Google, .provider stays 'email' forever. Read user.identities and
  // pick the most-recently-used one — that's the method this session used.
  const provider = !isAnon && user?.identities
    ? user.identities
        .slice()
        .sort((a, b) =>
          new Date(b.last_sign_in_at ?? 0).getTime() -
          new Date(a.last_sign_in_at ?? 0).getTime()
        )[0]?.provider ?? null
    : null

  return (
    <ProfileProvider initialProfile={profile}>
      <div className={styles.page}>
        <ProfileSideNav isAnon={isAnon} userEmail={userEmail} provider={provider} />
        <div className={styles.rightColumn}>
          <header className={styles.header}>
            <h1 className={styles.title}>ЛИЧНЫЙ КАБИНЕТ</h1>
          </header>
          <div className={styles.main}>{children}</div>
        </div>
        {/* Mobile-only auth slot. Hidden on desktop / tablet (where the
            sidebar embeds its own copy at the bottom). */}
        <ProfileAuthSlot
          className={styles.mobileAuthSlot}
          isAnon={isAnon}
          userEmail={userEmail}
          provider={provider}
        />
      </div>
    </ProfileProvider>
  )
}
