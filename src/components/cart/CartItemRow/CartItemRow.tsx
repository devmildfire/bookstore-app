'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { isSinglePurchaseCategory } from '@/consts/products'
import type { CartItem } from '@/entities/cart/client'
import { formatPrice, formatProductPrice } from '@/lib/formatPrice'
import styles from './CartItemRow.module.scss'

type Props = {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
}

const TYPE_LABELS: Record<string, string> = {
  EBook: 'Цифровое издание',
  PrintBook: 'Печатное издание',
  AudioBook: 'Аудиокнига',
  'Book2.0': 'Книга 2.0',
  GiftCard: 'Карта даров',
  Subscription: 'Подписка',
  Course: 'Курс',
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  const isSingle = isSinglePurchaseCategory(item.category)
  const displayQuantity = isSingle ? 1 : item.quantity

  // Heal pre-existing carts where a 1-per-buyer item somehow has qty>1.
  // After this fix `addToCart` caps these items at 1 going forward.
  useEffect(() => {
    if (isSingle && item.quantity > 1) {
      onUpdateQuantity(item.id, 1)
    }
  }, [isSingle, item.id, item.quantity, onUpdateQuantity])

  const originalUnitPrice =
    item.discount != null && item.discount > 0
      ? Math.round(item.price / (1 - item.discount / 100))
      : null

  const lineTotal = item.price * displayQuantity
  const typeLabel = TYPE_LABELS[item.category] ?? item.category

  return (
    <article className={styles.row}>
      <div className={styles.imageWrap}>
        {item.picture ? (
          <Image
            src={item.picture}
            alt={item.name}
            fill
            sizes='(max-width: 532px) 96px, 114px'
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{item.name}</h3>
        {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
      </div>

      <p className={styles.type}>{typeLabel}</p>

      <div className={styles.priceCol}>
        <span className={styles.price}>{formatProductPrice(item.price)}</span>
        {originalUnitPrice && (
          <span className={styles.priceOld}>{formatPrice(originalUnitPrice)}</span>
        )}
      </div>

      {isSingle ? (
        <span className={styles.stepperPlaceholder} aria-hidden />
      ) : (
        <div className={styles.stepper} role='group' aria-label='Количество'>
          <button
            type='button'
            className={styles.stepperBtn}
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1}
            aria-label='Уменьшить количество'
          >
            −
          </button>
          <span className={styles.stepperValue}>{item.quantity}</span>
          <button
            type='button'
            className={styles.stepperBtn}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            aria-label='Увеличить количество'
          >
            +
          </button>
        </div>
      )}

      <p className={styles.sum}>{formatProductPrice(lineTotal)}</p>

      <button
        type='button'
        className={styles.remove}
        onClick={() => onRemove(item.id)}
        aria-label={`Удалить «${item.name}» из корзины`}
      >
        <span aria-hidden>✕</span>
      </button>
    </article>
  )
}
