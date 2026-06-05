import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminSubscriptions } from '@/api/admin/subscriptions'
import { formatPrice } from '@/lib/formatPrice'
import StatusBadge from '@/components/admin/StatusBadge'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Подписки' }

export default async function AdminSubscriptionsPage() {
  const subscriptions = await getAdminSubscriptions()

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Подписки</h1>
        <span className={styles.count}>{subscriptions.length} всего</span>
        <Link href='/admin/subscriptions/new' className={styles.create}>
          + Создать подписку
        </Link>
      </header>

      {subscriptions.length === 0 ? (
        <p className={styles.empty}>Подписки не найдены.</p>
      ) : (
        <AdminList>
          {subscriptions.map((s) => (
            <AdminRow
              key={s.id}
              href={`/admin/subscriptions/${s.id}`}
              coverUrl={s.imageUrl}
              coverAlt={s.name}
              name={s.name}
              sub={`/${s.slug}`}
              value={formatPrice(s.price)}
              badges={
                <StatusBadge tone={s.isPublished ? 'positive' : 'warning'}>
                  {s.isPublished ? 'Опубл.' : 'Черновик'}
                </StatusBadge>
              }
            />
          ))}
        </AdminList>
      )}
    </section>
  )
}
