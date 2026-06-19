'use client'

import ProgressiveEmblaCarousel from '@/components/common/ProgressiveEmblaCarousel'
import GiftCardTierCard from '@/components/giftCards/GiftCardTierCard'
import type { GiftCardProduct } from '@/entities/giftCardProduct'
import styles from './GiftCardStorefront.module.scss'

type Props = {
  products: GiftCardProduct[]
}

export default function GiftCardCarousel({ products }: Props) {
  return (
    <ProgressiveEmblaCarousel
      items={products}
      getKey={(product) => String(product.id)}
      renderItem={(product) => <GiftCardTierCard product={product} />}
      baselineViewportClassName={styles.carouselViewport}
      baselineContainerClassName={styles.carouselScrollTrack}
      emblaViewportClassName={styles.carouselEmblaViewport}
      emblaContainerClassName={styles.carouselEmblaTrack}
      slideClassName={styles.carouselSlide}
      activeSlideClassName={styles.carouselSlideActive}
      options={{ align: 'center', loop: products.length > 1 }}
    />
  )
}
