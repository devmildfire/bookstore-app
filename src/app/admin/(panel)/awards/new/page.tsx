import type { Metadata } from 'next'
import Link from 'next/link'
import { AwardCreateForm } from '@/components/admin/awards'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая награда' }

export default function AdminAwardCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/awards'>← Все награды</Link>
      </div>
      <h1 className={styles.title}>Новая награда</h1>
      <AwardCreateForm />
    </section>
  )
}
