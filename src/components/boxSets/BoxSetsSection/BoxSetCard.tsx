'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/cart'
import { useToast } from '@/contexts/toast'
import type { BoxSet } from '@/entities/boxSet/client'
import cn from 'classnames'
import styles from './BoxSetsSection.module.scss'

const fmt = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

type Props = {
  boxSet: BoxSet
}

export default function BoxSetCard({ boxSet }: Props) {
  const { addItem, isPending } = useCart()
  const { success } = useToast()
  const [liked, setLiked] = useState(false)

  function handleAddToCart() {
    addItem({
      id: boxSet.cartId,
      name: boxSet.name,
      subtitle: 'Бокс-сет',
      price: boxSet.price,
      picture: null,
      discount: boxSet.discount,
      category: 'BoxSet',
    })
    success('Добавлено в корзину', boxSet.name)
  }

  function handleToggleLiked() {
    setLiked((prev) => !prev)
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        {boxSet.imageUrl && (
          <img
            src={boxSet.imageUrl}
            alt={boxSet.name}
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.name}>{boxSet.name}</h3>
        {boxSet.description && (
          <p className={styles.description}>{boxSet.description}</p>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.price}>{fmt.format(boxSet.price)}</span>

        <button
          type="button"
          className={styles.iconBtn}
          onClick={handleAddToCart}
          disabled={isPending}
          aria-label="Добавить в корзину"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        </button>

        <button
          type="button"
          className={cn(styles.iconBtn, liked && styles.iconBtnLiked)}
          onClick={handleToggleLiked}
          disabled={isPending}
          aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
