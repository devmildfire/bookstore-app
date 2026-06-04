import type { Metadata } from 'next'
import Link from 'next/link'
import { GiftCardCreateForm } from '@/components/admin/giftCards'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Новая карта даров' }

export default function AdminGiftCardCreatePage() {
  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/gift-cards'>← Все карты даров</Link>
      </div>
      <h1 className={styles.title}>Новая карта даров</h1>
      <GiftCardCreateForm />
    </section>
  )
}
