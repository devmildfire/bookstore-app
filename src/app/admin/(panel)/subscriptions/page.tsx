import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminSubscriptions } from '@/api/admin/subscriptions'
import { formatPrice } from '@/lib/formatPrice'
import StatusBadge from '@/components/admin/StatusBadge'
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
        <ul className={styles.list}>
          {subscriptions.map((s) => (
            <li key={s.id} className={styles.item}>
              <Link href={`/admin/subscriptions/${s.id}`} className={styles.itemLink}>
                <span className={styles.cover}>
                  {s.imageUrl ? (
                    <Image src={s.imageUrl} alt='' fill sizes='48px' className={styles.coverImg} unoptimized />
                  ) : (
                    <span className={styles.coverPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{s.name}</span>
                  <span className={styles.slug}>{s.slug}</span>
                </span>
                <span className={styles.value}>{formatPrice(s.price)}</span>
                <StatusBadge tone={s.isPublished ? 'positive' : 'warning'}>
                  {s.isPublished ? 'Опубл.' : 'Черновик'}
                </StatusBadge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
