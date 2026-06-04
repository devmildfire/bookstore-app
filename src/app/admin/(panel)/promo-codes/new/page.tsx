import type { Metadata } from 'next'
import Link from 'next/link'
import { getTitleOptions } from '@/api/admin/boxSets'
import { PromoCodeForm } from '@/components/admin/promoCodes'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новый промокод' }

export default async function AdminPromoCreatePage() {
  const titleOptions = await getTitleOptions()
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/promo-codes'>← Все промокоды</Link>
      </div>
      <h1 className={styles.title}>Новый промокод</h1>
      <PromoCodeForm mode='create' titleOptions={titleOptions} />
    </section>
  )
}
