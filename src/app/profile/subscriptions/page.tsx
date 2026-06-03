import type { Metadata } from 'next'
import { getUserSubscriptionsServer } from '@/api/subscriptions/getUserSubscriptionsServer'
import { isMockProvider } from '@/lib/payments/config'
import SubscriptionList from '@/components/profile/SubscriptionList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мои подписки',
  description: 'Управление подписками в личном кабинете Чтива.',
}

export default async function ProfileSubscriptionsPage() {
  const subscriptions = await getUserSubscriptionsServer()

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Мои подписки</h2>
      <SubscriptionList subscriptions={subscriptions} canChargeNow={isMockProvider()} />
    </section>
  )
}
