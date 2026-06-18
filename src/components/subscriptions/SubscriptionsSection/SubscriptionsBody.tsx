'use client'

import SubscriptionCard from './SubscriptionCard'
import SubscriptionsCarouselLazy from './SubscriptionsCarouselLazy'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// The visual body of the subscriptions section. Split out so it can be dynamically
// imported (ssr:false) by DeferredSubscriptions and mounted on scroll — keeping its
// JS chunk, images and DOM out of the initial/LCP window.
export default function SubscriptionsBody({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Чудеса подписки</h2>
        <p className={styles.subtitle}>Красиво и просто, как в сказке: деньги ежемесячно снимаются с вашей карты (надоест — отключим), а вам тем временем приходят все наши новые уникальные издания, теперь об этом можно не только мечтать.</p>

        <div className={styles.cards}>
          {subscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} sub={sub} />
          ))}
        </div>
      </div>

      <div className={styles.mobileCarousel}>
        <SubscriptionsCarouselLazy items={subscriptions} />
      </div>
    </>
  )
}
