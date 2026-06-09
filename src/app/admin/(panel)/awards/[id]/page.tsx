import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminAward } from '@/api/admin/awards'
import { AwardEditForm } from '@/components/admin/awards'
import ImageUploader from '@/components/admin/ImageUploader'
import { uploadAwardImageAction } from '@/lib/admin/awards/actions'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Награда' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminAwardEditPage({ params }: Props) {
  const { id } = await params
  const awardId = Number(id)
  if (!Number.isInteger(awardId) || awardId <= 0) notFound()

  const award = await getAdminAward(awardId)
  if (!award) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/awards'>← Все награды</Link>
      </div>

      <h1 className={styles.title}>{award.title}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Награда</h2>
        <AwardEditForm award={award} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Бейдж</h2>
        <p className={styles.sectionNote}>SVG, PNG, JPEG или WEBP. Отображается на странице книги.</p>
        <ImageUploader
          initialUrl={award.imageUrl}
          action={uploadAwardImageAction}
          fields={{ awardId: String(award.id) }}
          aspect='square'
          accept='image/svg+xml,image/png,image/jpeg,image/webp'
        />
      </section>
    </section>
  )
}
