import type { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getOrdersServer } from '@/api/orders/getOrdersServer'
import { ordersQueryKey } from '@/api/orders'
import MyCoursesList from '@/components/profile/MyCoursesList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мои курсы',
  description: 'Курсы, которыми вы владеете, в личном кабинете Чтива.',
}

export default async function ProfileCoursesPage() {
  // Prefetch the user's paid orders (courses are pulled from them) server-side
  // so the list renders populated; MyCoursesList's useQuery hydrates instantly.
  const qc = getServerQueryClient()
  await qc.prefetchQuery({ queryKey: ordersQueryKey, queryFn: getOrdersServer })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className={styles.page}>
        <h2 className={styles.title}>Мои курсы</h2>
        <MyCoursesList />
      </section>
    </HydrationBoundary>
  )
}
