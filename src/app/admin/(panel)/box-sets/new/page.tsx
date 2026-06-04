import type { Metadata } from 'next'
import Link from 'next/link'
import { BoxSetCreateForm } from '@/components/admin/boxSets'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новый бокс-сет' }

export default function AdminBoxSetCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/box-sets'>← Все бокс-сеты</Link>
      </div>
      <h1 className={styles.title}>Новый бокс-сет</h1>
      <BoxSetCreateForm />
    </section>
  )
}
