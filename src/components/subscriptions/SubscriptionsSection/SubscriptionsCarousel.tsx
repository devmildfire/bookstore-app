'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import cn from 'classnames'
import SubscriptionCard from './SubscriptionCard'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// Mobile-only carousel. The whole SubscriptionsBody is already deferred (mounted on scroll-approach
// by DeferredSubscriptions), so it's off the PSI/LCP window regardless — there's no reason to also
// defer Embla behind an interaction. So Embla is EAGER here: it initialises the instant the body
// mounts, giving the correct centred layout immediately. (Previously this used
// ProgressiveEmblaCarousel, whose baseline→Embla-on-click handoff left the carousel in a
// broken-looking static layout until the user tapped it.)
export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  const [active, setActive] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: false,
    loop: items.length > 1,
  })

  const onSelect = useCallback(() => {
    if (emblaApi) setActive(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <div className={styles.carouselEmblaViewport} ref={emblaRef}>
      <div className={styles.carouselEmblaTrack}>
        {items.map((sub, index) => (
          <div
            className={cn(styles.carouselSlide, index === active && styles.carouselSlideActive)}
            key={sub.id}
          >
            <SubscriptionCard sub={sub} />
          </div>
        ))}
      </div>
    </div>
  )
}
