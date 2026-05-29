import OutlinedButton from '@/components/common/OutlinedButton'
import { formatPrice } from '@/lib/formatPrice'
import styles from './CartTotals.module.scss'

type Props = {
  itemCount: number
  subtotal: number       // "Сумма" — post-book-discount sum
  discountAmount: number // additional savings from promo (0 if no promo or it doesn't beat book discounts)
  finalTotal: number     // "Итого" — what the user actually pays
  appliedCode: string | null
}

export default function CartTotals({ itemCount, subtotal, discountAmount, finalTotal, appliedCode }: Props) {
  const hasDiscount = discountAmount > 0

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
        <div className={styles.rowFinal}>
          <dt className={styles.labelFinal}>Итого:</dt>
          <dd className={styles.valueStrong}>{formatPrice(finalTotal)}</dd>
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
