'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import Image from 'next/image'
import type { Subscription } from '@/entities/subscription/client'
import styles from './SubscriptionsSection.module.scss'

export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  return (
    <Swiper
      modules={[Pagination]}
      slidesPerView={1.3}
      centeredSlides
      spaceBetween={16}
      pagination={{ el: `.${styles.pagination}`, clickable: true }}
      className={styles.swiper}
    >
      {items.map((sub) => (
        <SwiperSlide key={sub.id} className={styles.swiperSlide}>
          <SubscriptionCard sub={sub} />
        </SwiperSlide>
      ))}
      <div className={styles.pagination} />
    </Swiper>
  )
}

export function SubscriptionCard({ sub }: { sub: Subscription }) {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {sub.imageUrl ? (
          <Image
            src={sub.imageUrl}
            alt={sub.name}
            fill
            className={styles.image}
            sizes="(max-width: 532px) 90vw, 380px"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{sub.name}</h3>

        <ul className={styles.perks}>
          {sub.perks.map((perk) => (
            <li key={perk} className={styles.perk}>{perk}</li>
          ))}
        </ul>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{sub.price.toLocaleString('ru-RU')}₽</span>
          <span className={styles.priceLabel}>в месяц</span>
        </div>

        <button type="button" className={styles.connectBtn}>
          Подключить
        </button>
      </div>
    </div>
  )
}
