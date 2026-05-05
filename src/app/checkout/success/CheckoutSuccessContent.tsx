'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const delivery = searchParams.get('delivery')
  const email = searchParams.get('email')

  return (
    <div className={styles.page}>
      <div className={styles.icon}>✓</div>
      <h1>Заказ оформлен!</h1>
      <p className={styles.subtitle}>Спасибо за покупку.</p>

      {orderId && (
        <p className={styles.orderId}>
          Номер заказа: <strong>#{orderId}</strong>
        </p>
      )}

      <div className={styles.deliveryInfo}>
        {delivery === 'download' && (
          <>
            <p>Ваши книги доступны для скачивания.</p>
            <p className={styles.hint}>Ссылка для скачивания будет активна в течение 24 часов.</p>
          </>
        )}
        {delivery === 'email' && email && (
          <>
            <p>Книги будут отправлены на адрес:</p>
            <p className={styles.email}>{email}</p>
          </>
        )}
      </div>

      <div className={styles.actions}>
        <Link href='/books'>
          <Button variant='primary'>Вернуться в каталог</Button>
        </Link>
        <Link href='/account'>
          <Button variant='secondary'>История заказов</Button>
        </Link>
      </div>
    </div>
  )
}
