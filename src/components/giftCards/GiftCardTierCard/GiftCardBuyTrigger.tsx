'use client'

import { useState } from 'react'
import GiftCardAddToCartModal from '@/components/giftCards/GiftCardAddToCartModal'
import type { GiftCardProduct } from '@/entities/giftCardProduct'
import styles from './GiftCardTierCard.module.scss'

type Props = {
  product: GiftCardProduct
}

// Client leaf: the "Купить" button + its modal. Split out so the tier card body
// (image, name, face value) renders on the server.
export default function GiftCardBuyTrigger({ product }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button type='button' className={styles.button} onClick={() => setIsModalOpen(true)}>
        Купить
      </button>
      <GiftCardAddToCartModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}
