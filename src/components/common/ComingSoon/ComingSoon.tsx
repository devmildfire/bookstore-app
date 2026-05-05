import Link from 'next/link'
import styles from './ComingSoon.module.scss'

type Props = {
  title: string
}

export default function ComingSoon({ title }: Props) {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.label}>Скоро</p>
      <p className={styles.subtitle}>Эта страница находится в разработке.</p>
      <Link href='/' className={styles.link}>На главную</Link>
    </div>
  )
}
