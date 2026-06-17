'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import SubscriptionCard from './SubscriptionCard'
import type { Subscription } from '@/entities/subscription'
import styles from './SubscriptionsSection.module.scss'

// Mobile-only Swiper. SubscriptionCard renders as client here (inside this client module),
// but as a server component in the desktop grid (SubscriptionsSection).
export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  return (
    <Swiper slidesPerView={1.6} centeredSlides spaceBetween={16} className={styles.swiper}>
      {items.map((sub) => (
        <SwiperSlide key={sub.id} className={styles.swiperSlide}>
          <SubscriptionCard sub={sub} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
