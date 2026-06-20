import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/server'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getOrderHistoryServer } from '@/api/orders/getOrdersServer'
import { orderHistoryQueryKey } from '@/api/orders/getOrders'
import OrderHistoryList from '@/components/profile/OrderHistoryList'
import AccountPostCheckoutModal from '@/components/profile/AccountPostCheckoutModal'
import styles from './page.module.scss'

type Props = {
  searchParams: Promise<{ from?: string; order?: string; payment?: string }>
}

export default async function ProfileOrdersPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  const highlightOrderId = params.order ? Number(params.order) : undefined
  // Arrived here from FailURL — surface the right notice on that order (a bank
  // decline reads differently from a cancellation), then offer to retry.
  const paymentOutcome =
    params.payment === 'declined' || params.payment === 'cancelled' || params.payment === 'failed'
      ? params.payment
      : undefined
  // Post-checkout cookie-tether reminder is for anonymous users only —
  // a logged-in user's purchases are already portable across devices.
  const isAnon = !user || user.is_anonymous === true
  const showRecoveryModal = isAnon && params.from === 'checkout'

  // Prefetch the order history server-side so the list renders populated (no
  // client spinner); the client useQuery hydrates and stays reactive for the
  // cancel/resume invalidations.
  const qc = getServerQueryClient()
  await qc.prefetchQuery({ queryKey: orderHistoryQueryKey, queryFn: getOrderHistoryServer })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className={styles.page}>
        <h2 className={styles.title}>Заказы</h2>
        <OrderHistoryList
          highlightOrderId={highlightOrderId}
          noticeOrderId={paymentOutcome ? highlightOrderId : undefined}
          noticeKind={paymentOutcome}
        />
        {showRecoveryModal && <AccountPostCheckoutModal />}
      </section>
    </HydrationBoundary>
  )
}
