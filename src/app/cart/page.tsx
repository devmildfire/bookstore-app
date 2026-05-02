'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearItems, isPending } = useCart()

  const totalFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(total)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Корзина пуста</h1>
        <p>Добавьте книги из каталога.</p>
        <Link href='/books'>
          <Button variant='primary'>Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Корзина</h1>
        <span className={styles.count}>{itemCount} {itemCount === 1 ? 'товар' : 'товаров'}</span>
        <Button variant='ghost' size='sm' onClick={clearItems} disabled={isPending}>
          Очистить корзину
        </Button>
      </div>

      <div className={styles.items}>
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Итого</span>
          <span className={styles.summaryTotal}>{totalFormatted}</span>
        </div>
        <Link href='/checkout'>
          <Button variant='primary' size='lg' className={styles.checkoutBtn} disabled={isPending}>
            Оформить заказ
          </Button>
        </Link>
      </div>
    </div>
  )
}
