'use client'

import Image from 'next/image'
import type { CartItem } from '@/entities/cart/client'
import { formatPrice } from '@/lib/formatPrice'
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
  Subscription: 'Подписка',
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  const originalUnitPrice =
    item.discount != null && item.discount > 0
      ? Math.round(item.price / (1 - item.discount / 100))
      : null

  const lineTotal = item.price * item.quantity
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
        <span className={styles.price}>{formatPrice(item.price)}</span>
        {originalUnitPrice && (
          <span className={styles.priceOld}>{formatPrice(originalUnitPrice)}</span>
        )}
      </div>

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

      <p className={styles.sum}>{formatPrice(lineTotal)}</p>

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
