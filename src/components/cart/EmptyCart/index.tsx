import Link from 'next/link'
import styles from './EmptyCart.module.scss'

export default function EmptyCart() {
  return (
    <div className={styles.root}>
      <h2 className={styles.headline}>В корзине пока ничего нет</h2>
      <p className={styles.body}>
        Вернитесь на главную или воспользуйтесь поиском, чтобы выбрать что-то
      </p>
      <Link href='/' className={styles.cta}>
        Перейти на главную
      </Link>
    </div>
  )
}
