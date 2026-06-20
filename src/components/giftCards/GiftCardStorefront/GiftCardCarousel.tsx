'use client'

import CardCarousel from '@/components/common/CardCarousel'
import GiftCardTierCard from '@/components/giftCards/GiftCardTierCard'
import type { GiftCardProduct } from '@/entities/giftCardProduct'
import styles from './GiftCardStorefront.module.scss'

type Props = {
  products: GiftCardProduct[]
}

export default function GiftCardCarousel({ products }: Props) {
  return (
    <CardCarousel
      items={products}
      getKey={(product) => String(product.id)}
      renderItem={(product) => <GiftCardTierCard product={product} />}
      viewportClassName={styles.carouselEmblaViewport}
      containerClassName={styles.carouselEmblaTrack}
      slideClassName={styles.carouselSlide}
      activeSlideClassName={styles.carouselSlideActive}
    />
  )
}
