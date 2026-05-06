import { getSubscriptions } from '@/api/subscriptions/getSubscriptions'
import { SubscriptionCard } from './SubscriptionsCarousel'
import SubscriptionsCarousel from './SubscriptionsCarousel'
import styles from './SubscriptionsSection.module.scss'

export default async function SubscriptionsSection() {
  const subscriptions = await getSubscriptions()

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Чудеса подписки</h2>
        <p className={styles.subtitle}>Поддержите издательство и получите особые привилегии читателя</p>

        <div className={styles.cards}>
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} />
          ))}
        </div>
      </div>

      <div className={styles.mobileCarousel}>
        <SubscriptionsCarousel items={subscriptions} />
      </div>
    </section>
  )
}
