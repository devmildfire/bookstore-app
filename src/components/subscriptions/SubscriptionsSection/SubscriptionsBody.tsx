'use client'

import SubscriptionCard from './SubscriptionCard'
import SubscriptionsCarousel from './SubscriptionsCarousel'
import SubscriptionsCarouselLazy from './SubscriptionsCarouselLazy'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// The visual body of the subscriptions section. Split out so it can be dynamically
// imported (ssr:false) by DeferredSubscriptions and mounted on scroll — keeping its
// JS chunk, images and DOM out of the initial/LCP window.
//
// `eager` (the dedicated /subscription page): SSR the mobile carousel directly
// instead of the ssr:false lazy wrapper. There the carousel is above-the-fold,
// so deferring it pops in on hydration (CLS) and makes its image a late LCP.
export default function SubscriptionsBody({
  subscriptions,
  eager = false,
}: {
  subscriptions: Subscription[]
  eager?: boolean
}) {
  // The `.section` wrapper lives HERE (the lazy body), not in DeferredSubscriptions — so this
  // module's CSS only ships in the lazy chunk, never the eager render-blocking bundle.
  return (
    <section className={styles.section}>
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
        {eager ? (
          <SubscriptionsCarousel items={subscriptions} />
        ) : (
          <SubscriptionsCarouselLazy items={subscriptions} />
        )}
      </div>
    </section>
  )
}
