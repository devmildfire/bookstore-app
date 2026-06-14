'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import Image from 'next/image'
import Link from 'next/link'
import cn from 'classnames'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import type { Subscription } from '@/entities/subscription'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import styles from './SubscriptionsSection.module.scss'

export default function SubscriptionsCarousel({ items }: { items: Subscription[] }) {
  return (
    <Swiper
      slidesPerView={1.6}
      centeredSlides
      spaceBetween={16}
      className={styles.swiper}
    >
      {items.map((sub) => (
        <SwiperSlide key={sub.id} className={styles.swiperSlide}>
          <SubscriptionCard sub={sub} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export function SubscriptionCard({ sub }: { sub: Subscription }) {
  const { items, addItem, isPending } = useCart()
  const { cartSuccess } = useToast()

  const inCart = items.some((item) => item.id === sub.cartId)

  function handleAddToCart() {
    if (inCart) return
    addItem({
      id: sub.cartId,
      name: sub.name,
      subtitle: 'Подписка',
      price: sub.price,
      picture: sub.imageUrl,
      discount: sub.discount,
      category: 'Subscription',
    })
    cartSuccess('Добавлено в корзину', sub.name)
  }

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
            placeholder={sub.imageBlurDataUrl ? 'blur' : 'empty'}
            blurDataURL={sub.imageBlurDataUrl ?? undefined}
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
          <span className={styles.price}>{formatProductPrice(sub.price)}</span>
          {sub.originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(sub.originalPrice)}</span>
          )}
          <span className={styles.priceLabel}>в месяц</span>
        </div>

        {inCart ? (
          <Link href="/cart" className={cn(styles.connectBtn, styles.connectBtnInCart)}>
            В корзине
          </Link>
        ) : (
          <button
            type="button"
            className={styles.connectBtn}
            onClick={handleAddToCart}
            disabled={isPending}
          >
            Подключить
          </button>
        )}
      </div>
    </div>
  )
}
