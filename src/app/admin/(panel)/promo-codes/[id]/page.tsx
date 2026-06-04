import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminPromoCode } from '@/api/admin/promoCodes'
import { getTitleOptions } from '@/api/admin/boxSets'
import { PromoCodeForm } from '@/components/admin/promoCodes'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Промокод' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminPromoEditPage({ params }: Props) {
  const { id } = await params
  const [promo, titleOptions] = await Promise.all([getAdminPromoCode(id), getTitleOptions()])
  if (!promo) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/promo-codes'>← Все промокоды</Link>
      </div>
      <h1 className={styles.title}>{promo.code}</h1>
      <PromoCodeForm mode='edit' titleOptions={titleOptions} promo={promo} />
    </section>
  )
}
