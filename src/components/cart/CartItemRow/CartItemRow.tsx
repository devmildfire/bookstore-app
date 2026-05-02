'use client'

import Image from 'next/image'
import cn from 'classnames'
import Button from '@/components/common/Button'
import type { CartItem } from '@/entities/cart/client'
import styles from './CartItemRow.module.scss'

type Props = {
  item: CartItem
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  className?: string
}

export default function CartItemRow({ item, onUpdateQuantity, onRemove, className }: Props) {
  const priceFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(item.price)

  const totalFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(item.price * item.quantity)

  return (
    <div className={cn(styles.row, className)}>
      <div className={styles.imageWrapper}>
        {item.picture ? (
          <Image
            src={item.picture}
            alt={item.name}
            fill
            sizes='80px'
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.title}>{item.name}</h3>
        {item.subtitle && <p className={styles.subtitle}>{item.subtitle}</p>}
        <span className={styles.price}>{priceFormatted}</span>
      </div>

      <div className={styles.quantity}>
        <button
          className={styles.qtyBtn}
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          aria-label='Уменьшить количество'
        >
          −
        </button>
        <span className={styles.qtyValue}>{item.quantity}</span>
        <button
          className={styles.qtyBtn}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          aria-label='Увеличить количество'
        >
          +
        </button>
      </div>

      <div className={styles.total}>
        <span className={styles.totalPrice}>{totalFormatted}</span>
      </div>

      <Button
        variant='ghost'
        size='sm'
        onClick={() => onRemove(item.id)}
        className={styles.removeBtn}
        aria-label={`Удалить «${item.name}» из корзины`}
      >
        ✕
      </Button>
    </div>
  )
}
