import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthorCreateForm } from '@/components/admin/authors'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новый автор' }

export default function AdminAuthorCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/authors'>← Все авторы</Link>
      </div>
      <h1 className={styles.title}>Новый автор</h1>
      <AuthorCreateForm />
    </section>
  )
}
