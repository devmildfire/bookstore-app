'use client'

import Link from 'next/link'
import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function CheckoutPage() {
  const { items, total, itemCount, updateQuantity, removeItem } = useCart()

  const totalFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(total)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Корзина пуста</h1>
        <p>Добавьте книги из каталога для оформления заказа.</p>
        <Link href='/books'>
          <Button variant='primary'>Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1>Оформление заказа</h1>

      <div className={styles.content}>
        <div className={styles.itemsSection}>
          <h2 className={styles.sectionTitle}>Товары ({itemCount})</h2>
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
        </div>

        <div className={styles.summary}>
          <h2 className={styles.sectionTitle}>Итого</h2>
          <div className={styles.summaryCard}>
            <div className={styles.summaryRow}>
              <span>Товары ({itemCount})</span>
              <span>{totalFormatted}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.summaryRow}>
              <span className={styles.totalLabel}>К оплате</span>
              <span className={styles.totalPrice}>{totalFormatted}</span>
            </div>
            <Button variant='primary' size='lg' className={styles.payBtn}>
              Оплатить {totalFormatted}
            </Button>
            <p className={styles.hint}>Оплата в тестовом режиме. Реальные средства не списываются.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
