'use client'

import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import CartTotals from '@/components/cart/CartTotals'
import EmptyCart from '@/components/cart/EmptyCart'
import PromoCodeForm from '@/components/cart/PromoCodeForm'
import styles from './page.module.scss'

export default function CartPage() {
  const {
    items,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    appliedPromo,
    discountAmount,
    finalTotal,
  } = useCart()

  const isEmpty = items.length === 0

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Корзина</h1>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <>
          <div className={styles.itemsGrid}>
            <div className={styles.headerRow} aria-hidden>
              <span className={styles.headerCell}>Товар</span>
              <span className={styles.headerCell}>Тип</span>
              <span className={styles.headerCell}>Цена</span>
              <span className={styles.headerCell}>Количество</span>
              <span className={styles.headerCell}>Сумма</span>
            </div>

            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.promo}>
              <PromoCodeForm />
            </div>
            <div className={styles.totals}>
              <CartTotals
                itemCount={itemCount}
                subtotal={total}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                appliedCode={appliedPromo?.code ?? null}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
