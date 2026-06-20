'use client'

import CardCarousel from '@/components/common/CardCarousel'
import SubscriptionCard from './SubscriptionCard'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// Mobile-only carousel. Uses the shared eager CardCarousel — Embla initialises on mount (the whole
// SubscriptionsBody is already deferred via DeferredSubscriptions, so it's off the PSI window anyway).
export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  return (
    <CardCarousel
      items={items}
      getKey={(sub) => String(sub.id)}
      renderItem={(sub) => <SubscriptionCard sub={sub} />}
      viewportClassName={styles.carouselEmblaViewport}
      containerClassName={styles.carouselEmblaTrack}
      slideClassName={styles.carouselSlide}
      activeSlideClassName={styles.carouselSlideActive}
    />
  )
}
