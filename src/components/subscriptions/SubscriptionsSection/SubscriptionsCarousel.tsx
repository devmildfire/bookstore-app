'use client'

import ProgressiveEmblaCarousel from '@/components/common/ProgressiveEmblaCarousel'
import SubscriptionCard from './SubscriptionCard'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// Mobile-only carousel. SubscriptionCard renders as client here (inside this client module),
// but as a server component in the desktop grid (SubscriptionsSection).
export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  return (
    <ProgressiveEmblaCarousel
      items={items}
      getKey={(sub) => String(sub.id)}
      renderItem={(sub) => <SubscriptionCard sub={sub} />}
      baselineViewportClassName={styles.carouselViewport}
      baselineContainerClassName={styles.carouselScrollTrack}
      emblaViewportClassName={styles.carouselEmblaViewport}
      emblaContainerClassName={styles.carouselEmblaTrack}
      slideClassName={styles.carouselSlide}
      activeSlideClassName={styles.carouselSlideActive}
      options={{ align: 'center', loop: items.length > 1 }}
    />
  )
}
