'use client'

import Image from 'next/image'
import { useCart } from '@/contexts/cart'
import { formatPrice } from '@/lib/formatPrice'
import styles from './GiftCardPicker.module.scss'

export default function GiftCardPicker() {
  const {
    availableGiftCards,
    selectedGiftCardIds,
    toggleGiftCard,
    giftCardPayments,
    giftCardEligibleTotal,
    finalTotal,
  } = useCart()

  const eligibleTotal = Math.min(giftCardEligibleTotal, finalTotal)

  if (availableGiftCards.length === 0 || eligibleTotal <= 0) return null

  return (
    <section className={styles.picker}>
      <h2 className={styles.title}>Карты даров</h2>
      <ul className={styles.list}>
        {availableGiftCards.map((card) => {
          const payment = giftCardPayments.find((item) => item.id === card.id)
          const isSelected = selectedGiftCardIds.has(card.id)

          return (
            <li key={card.id} className={`${styles.item} ${isSelected ? styles.itemSelected : ''}`}>
              <div className={styles.imageWrap}>
                {card.productImageUrl ? (
                  <Image
                    src={card.productImageUrl}
                    alt={card.productName}
                    fill
                    className={styles.image}
                    sizes='(max-width: 532px) 90vw, 120px'
                  />
                ) : (
                  <div className={styles.imagePlaceholder} aria-hidden />
                )}
              </div>

              <div className={styles.info}>
                <h3 className={styles.name}>{card.productName}</h3>
                <p className={styles.balance}>Остаток: {formatPrice(card.balance)}</p>
                {payment && payment.amount > 0 && (
                  <p className={styles.applied}>Спишется: {formatPrice(payment.amount)}</p>
                )}
              </div>

              <button
                type='button'
                className={`${styles.button} ${isSelected ? styles.buttonActive : ''}`}
                onClick={() => toggleGiftCard(card.id)}
              >
                {isSelected ? 'Не использовать' : 'Использовать'}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
