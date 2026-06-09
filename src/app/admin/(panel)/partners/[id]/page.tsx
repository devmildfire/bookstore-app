import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminPartner } from '@/api/admin/partners'
import { PartnerEditForm } from '@/components/admin/partners'
import ImageUploader from '@/components/admin/ImageUploader'
import { uploadPartnerLogoAction } from '@/lib/admin/partners/actions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Партнёр' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminPartnerEditPage({ params }: Props) {
  const { id } = await params
  const partnerId = Number(id)
  if (!Number.isInteger(partnerId) || partnerId <= 0) notFound()

  const partner = await getAdminPartner(partnerId)
  if (!partner) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/partners'>← Все партнёры</Link>
      </div>

      <h1 className={styles.title}>{partner.name}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Партнёр</h2>
        <PartnerEditForm partner={partner} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Логотип</h2>
        <p className={styles.sectionNote}>
          Плитка 250×250 (тёмный фон + логотип). SVG, PNG, JPEG или WEBP. Без логотипа на странице
          «О Чтиве» показывается плитка с названием.
        </p>
        <ImageUploader
          initialUrl={partner.logoUrl}
          action={uploadPartnerLogoAction}
          fields={{ partnerId: String(partner.id) }}
          aspect='square'
          accept='image/svg+xml,image/png,image/jpeg,image/webp'
        />
      </section>
    </section>
  )
}
