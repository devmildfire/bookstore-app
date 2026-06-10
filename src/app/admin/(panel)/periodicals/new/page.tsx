import type { Metadata } from 'next'
import Link from 'next/link'
import { PeriodicalCreateForm } from '@/components/admin/periodicals'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая серия' }

export default function AdminPeriodicalCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/periodicals'>← Вся периодика</Link>
      </div>
      <h1 className={styles.title}>Новая серия</h1>
      <PeriodicalCreateForm />
    </section>
  )
}
