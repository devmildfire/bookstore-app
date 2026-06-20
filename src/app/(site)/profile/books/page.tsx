import type { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/query/getServerQueryClient'
import { getOrdersServer } from '@/api/orders/getOrdersServer'
import { ordersQueryKey } from '@/api/orders/getOrders'
import MyBooksList from '@/components/profile/MyBooksList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мои книги',
  description: 'Книги, которыми вы владеете, в личном кабинете Чтива.',
}

export default async function ProfileBooksPage() {
  // Prefetch the user's paid orders (the library source) server-side so the
  // list renders populated; MyBooksList's useQuery hydrates with no spinner.
  const qc = getServerQueryClient()
  await qc.prefetchQuery({ queryKey: ordersQueryKey, queryFn: getOrdersServer })

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className={styles.page}>
        <h2 className={styles.title}>Мои книги</h2>
        <MyBooksList />
      </section>
    </HydrationBoundary>
  )
}
