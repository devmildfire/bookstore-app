import Link from 'next/link'
import { formatPrice } from '@/lib/formatPrice'
import styles from './CartTotals.module.scss'

type Props = {
  itemCount: number
  total: number
}

export default function CartTotals({ itemCount, total }: Props) {
  return (
    <div className={styles.root}>
      <dl className={styles.list}>
        <div className={styles.row}>
          <dt className={styles.label}>Количество:</dt>
          <dd className={styles.value}>{itemCount}</dd>
        </div>
        <div className={styles.row}>
          <dt className={styles.label}>Сумма:</dt>
          <dd className={styles.valueStrong}>{formatPrice(total)}</dd>
        </div>
      </dl>

      <Link href='/checkout' className={styles.continue}>
        Продолжить
      </Link>

      <p className={styles.caption}>
        После оплаты нажмите «Вернуться в магазин», чтобы скачать книгу.
      </p>
    </div>
  )
}
