'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import GiftCardTierCard from '@/components/giftCards/GiftCardTierCard'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'
import styles from './GiftCardStorefront.module.scss'

type Props = {
  products: GiftCardProduct[]
}

export default function GiftCardCarousel({ products }: Props) {
  return (
    <Swiper
      slidesPerView={1.6}
      centeredSlides
      spaceBetween={16}
      className={styles.swiper}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id} className={styles.swiperSlide}>
          <GiftCardTierCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
