import { createClient } from '@/lib/supabase/server'
import ProfileMainPanel from '@/components/profile/ProfileMainPanel'
import AccountPostCheckoutModal from '@/components/profile/AccountPostCheckoutModal'

type Props = {
  searchParams: Promise<{ from?: string; order?: string }>
}

export default async function ProfilePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  const isAnon = !user || user.is_anonymous === true
  const showRecoveryModal = isAnon && params.from === 'checkout'

  return (
    <>
      <ProfileMainPanel />
      {showRecoveryModal && <AccountPostCheckoutModal />}
    </>
  )
}
