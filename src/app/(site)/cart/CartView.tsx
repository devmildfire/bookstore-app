'use client'

import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import CartTotals from '@/components/cart/CartTotals'
import EmptyCart from '@/components/cart/EmptyCart'
import GiftCardPicker from '@/components/cart/GiftCardPicker'
import PromoCodeForm from '@/components/cart/PromoCodeForm'
import type { CartItem } from '@/entities/cart/client'
import type { CartQuote } from '@/api/cart/quoteCart'
import styles from './page.module.scss'

type Props = {
  initialItems?: CartItem[]
  initialQuote?: CartQuote | null
}

export default function CartView({ initialItems, initialQuote }: Props = {}) {
  const {
    items: liveItems,
    total: liveTotal,
    itemCount: liveItemCount,
    updateQuantity,
    removeItem,
    appliedPromo,
    discountAmount: liveDiscount,
    finalTotal: liveFinalTotal,
    giftCardAppliedTotal,
    amountDue,
    isCartReady,
  } = useCart()

  // Until the client cart query has resolved, render from the server-fetched
  // props (passed by page.tsx). SSR and the first client render both take this
  // branch → identical markup, zero CLS. Once the query settles, the live cart
  // drives everything (handles edits/empties correctly). Gift-card selection
  // and the promo-code label are client-only, so they stay on the live values
  // (0 / null pre-resolution — matching SSR, no shift).
  const showInitial = !isCartReady && initialItems !== undefined
  const items = showInitial ? initialItems : liveItems
  const total = showInitial ? (initialQuote?.subtotal ?? 0) : liveTotal
  const itemCount = showInitial
    ? initialItems.reduce((sum, item) => sum + item.quantity, 0)
    : liveItemCount
  const discountAmount = showInitial ? (initialQuote?.discountAmount ?? 0) : liveDiscount
  const finalTotal = showInitial ? (initialQuote?.total ?? 0) : liveFinalTotal

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
              <GiftCardPicker />
            </div>
            <div className={styles.totals}>
              <CartTotals
                itemCount={itemCount}
                subtotal={total}
                discountAmount={discountAmount}
                finalTotal={finalTotal}
                appliedCode={appliedPromo?.code ?? null}
                giftCardAppliedTotal={giftCardAppliedTotal}
                amountDue={amountDue}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
