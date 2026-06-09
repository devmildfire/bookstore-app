import type { Metadata } from 'next'
import Link from 'next/link'
import { PartnerCreateForm } from '@/components/admin/partners'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новый партнёр' }

export default function AdminPartnerCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/partners'>← Все партнёры</Link>
      </div>
      <h1 className={styles.title}>Новый партнёр</h1>
      <PartnerCreateForm />
    </section>
  )
}
