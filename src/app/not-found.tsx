import Link from 'next/link'
import Button from '@/components/common/Button'
import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Страница не найдена</h1>
      <p className={styles.subtitle}>Такой страницы не существует или она была удалена.</p>
      <Link href='/'>
        <Button variant='primary'>На главную</Button>
      </Link>
    </div>
  )
}
