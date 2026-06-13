import type { Metadata } from 'next'
import { getAdminSubscribers, type SubscriberStatus } from '@/api/admin/subscribers'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import StatusBadge from '@/components/admin/StatusBadge'
import type { BadgeTone } from '@/components/admin/StatusBadge/StatusBadge'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Подписчики' }

const STATUS_LABEL: Record<SubscriberStatus, string> = {
  pending: 'Ожидает',
  active: 'Активен',
  unsubscribed: 'Отписался',
}
const STATUS_TONE: Record<SubscriberStatus, BadgeTone> = {
  pending: 'warning',
  active: 'positive',
  unsubscribed: 'neutral',
}

export default async function AdminSubscribersPage() {
  const subscribers = await getAdminSubscribers()
  const active = subscribers.filter((s) => s.status === 'active').length

  return (
    <section className={styles.page}>
      <AdminPageHeader title='Подписчики' count={`${active} активных · ${subscribers.length} всего`} />

      {subscribers.length === 0 ? (
        <p className={styles.empty}>Подписчиков пока нет.</p>
      ) : (
        <ul className={styles.list}>
          {subscribers.map((s) => (
            <li key={s.id} className={styles.item}>
              <span className={styles.info}>
                <span className={styles.email}>{s.email}</span>
                <span className={styles.meta}>
                  {s.source ? `источник: ${s.source}` : 'источник не указан'} ·{' '}
                  {new Date(s.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </span>
              <StatusBadge tone={STATUS_TONE[s.status]}>{STATUS_LABEL[s.status]}</StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
