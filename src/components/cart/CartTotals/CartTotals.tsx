import OutlinedButton from '@/components/common/OutlinedButton'
import { formatPrice } from '@/lib/formatPrice'
import styles from './CartTotals.module.scss'

type Props = {
  itemCount: number
  subtotal: number              // "Сумма" — post-book-discount sum
  discountAmount: number        // additional savings from promo (0 if no promo or it doesn't beat book discounts)
  finalTotal: number            // "Итого" — sum after promo, before gift cards
  appliedCode: string | null
  giftCardAppliedTotal: number  // amount the user's selected gift cards will cover
  amountDue: number             // finalTotal − giftCardAppliedTotal — what the user actually pays at checkout
}

export default function CartTotals({
  itemCount,
  subtotal,
  discountAmount,
  finalTotal,
  appliedCode,
  giftCardAppliedTotal,
  amountDue,
}: Props) {
  const hasDiscount = discountAmount > 0
  const hasGiftCards = giftCardAppliedTotal > 0

  return (
    <div className={styles.root}>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.label}>Количество:</dt>
          <dd className={styles.value}>{itemCount}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>Сумма:</dt>
          <dd className={styles.value}>{formatPrice(subtotal)}</dd>
        </div>
        {hasDiscount && (
          <div className={styles.row}>
            <dt className={styles.label}>
              Скидка{appliedCode ? ` (${appliedCode})` : ''}:
            </dt>
            <dd className={styles.discountValue}>−{formatPrice(discountAmount)}</dd>
          </div>
        )}
        {hasGiftCards && (
          <div className={styles.row}>
            <dt className={styles.label}>Карты даров:</dt>
            <dd className={styles.discountValue}>−{formatPrice(giftCardAppliedTotal)}</dd>
          </div>
        )}
        <div className={styles.rowFinal}>
          <dt className={styles.labelFinal}>{hasGiftCards ? 'К оплате:' : 'Итого:'}</dt>
          <dd className={styles.valueStrong}>{formatPrice(hasGiftCards ? amountDue : finalTotal)}</dd>
        </div>
      </dl>

      <OutlinedButton href='/checkout' className={styles.continue} fitContainer>
        Продолжить
      </OutlinedButton>

      <p className={styles.caption}>
        После оплаты нажмите «Вернуться в магазин», чтобы скачать книгу.
      </p>
    </div>
  )
}
