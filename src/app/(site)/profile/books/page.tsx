import type { Metadata } from 'next'
import MyBooksList from '@/components/profile/MyBooksList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Мои книги',
  description: 'Книги, которыми вы владеете, в личном кабинете Чтива.',
}

export default function ProfileBooksPage() {
  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Мои книги</h2>
      <MyBooksList />
    </section>
  )
}
