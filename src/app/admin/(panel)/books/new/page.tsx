import type { Metadata } from 'next'
import Link from 'next/link'
import { BookCreateForm } from '@/components/admin/books'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая книга' }

export default function AdminBookCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/books'>← Все книги</Link>
      </div>
      <h1 className={styles.title}>Новая книга</h1>
      <BookCreateForm />
    </section>
  )
}
