import Link from 'next/link'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function CheckoutFailurePage() {
  return (
    <div className={styles.page}>
      <div className={styles.icon}>✕</div>
      <h1>Ошибка оплаты</h1>
      <p className={styles.subtitle}>Не удалось обработать платёж. Попробуйте снова или выберите другой способ оплаты.</p>
      <div className={styles.actions}>
        <Link href='/checkout'>
          <Button variant='primary'>Попробовать снова</Button>
        </Link>
        <Link href='/cart'>
          <Button variant='secondary'>Вернуться в корзину</Button>
        </Link>
      </div>
    </div>
  )
}
