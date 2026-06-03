import { createClient } from '@/lib/supabase/server'
import OrderHistoryList from '@/components/profile/OrderHistoryList'
import AccountPostCheckoutModal from '@/components/profile/AccountPostCheckoutModal'
import styles from './page.module.scss'

type Props = {
  searchParams: Promise<{ from?: string; order?: string }>
}

export default async function ProfileOrdersPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  const highlightOrderId = params.order ? Number(params.order) : undefined
  // Post-checkout cookie-tether reminder is for anonymous users only —
  // a logged-in user's purchases are already portable across devices.
  const isAnon = !user || user.is_anonymous === true
  const showRecoveryModal = isAnon && params.from === 'checkout'

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Заказы</h2>
      <OrderHistoryList highlightOrderId={highlightOrderId} />
      {showRecoveryModal && <AccountPostCheckoutModal />}
    </section>
  )
}
