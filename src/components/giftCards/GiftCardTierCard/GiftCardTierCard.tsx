'use client'

import { useState } from 'react'
import Image from 'next/image'
import GiftCardAddToCartModal from '@/components/giftCards/GiftCardAddToCartModal'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCardProduct } from '@/entities/giftCardProduct/client'
import styles from './GiftCardTierCard.module.scss'

type Props = {
  product: GiftCardProduct
}

export default function GiftCardTierCard({ product }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <article className={styles.card}>
        <div className={styles.imageWrap}>
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className={styles.image}
              sizes='(max-width: 532px) 90vw, (max-width: 1200px) 33vw, 380px'
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden />
          )}
        </div>

        <div className={styles.body}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.value}>{formatPrice(product.faceValue)}</p>
          <button
            type='button'
            className={styles.button}
            onClick={() => setIsModalOpen(true)}
          >
            Купить
          </button>
        </div>
      </article>

      <GiftCardAddToCartModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
