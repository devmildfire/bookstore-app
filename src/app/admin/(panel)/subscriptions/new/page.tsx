import type { Metadata } from 'next'
import Link from 'next/link'
import { SubscriptionCreateForm } from '@/components/admin/subscriptions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая подписка' }

export default function AdminSubscriptionCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/subscriptions'>← Все подписки</Link>
      </div>
      <h1 className={styles.title}>Новая подписка</h1>
      <SubscriptionCreateForm />
    </section>
  )
}
