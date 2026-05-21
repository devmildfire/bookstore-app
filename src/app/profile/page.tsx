import { createClient } from '@/lib/supabase/server'
import ProfileEditor from '@/components/profile/ProfileEditor'
import SecurityCard from '@/components/profile/SecurityCard'
import AccountPostCheckoutModal from '@/components/profile/AccountPostCheckoutModal'
import styles from './page.module.scss'

type Props = {
  searchParams: Promise<{ from?: string; order?: string }>
}

export default async function ProfilePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  const isAnon = user?.is_anonymous === true
  const userEmail = user?.email ?? null
  const oauthProvider = (user?.app_metadata?.provider as string | undefined) ?? null
  const showRecoveryModal = isAnon && params.from === 'checkout'

  return (
    <div className={styles.page}>
      <ProfileEditor isAnon={isAnon} userEmail={userEmail} />
      <SecurityCard isAnon={isAnon} userEmail={userEmail} oauthProvider={oauthProvider} />
      {showRecoveryModal && <AccountPostCheckoutModal />}
    </div>
  )
}
