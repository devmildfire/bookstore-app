import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminGiftCard } from '@/api/admin/giftCards'
import { uploadGiftCardImageAction } from '@/lib/admin/giftCards/actions'
import ImageUploader from '@/components/admin/ImageUploader'
import { GiftCardEditForm } from '@/components/admin/giftCards'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Карта даров' }

type Props = { params: Promise<{ id: string }> }

export default async function AdminGiftCardEditPage({ params }: Props) {
  const { id } = await params
  const gcId = Number(id)
  if (!Number.isInteger(gcId) || gcId <= 0) notFound()

  const giftCard = await getAdminGiftCard(gcId)
  if (!giftCard) notFound()

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumb}>
        <Link href='/admin/gift-cards'>← Все карты даров</Link>
      </div>
      <h1 className={styles.title}>{giftCard.name}</h1>

      <div className={styles.layout}>
        <aside className={styles.side}>
          <h2 className={styles.sideTitle}>Картинка</h2>
          <ImageUploader
            initialUrl={giftCard.imageUrl}
            action={uploadGiftCardImageAction}
            fields={{ giftCardId: String(giftCard.id) }}
            aspect='square'
            label={`Карта: ${giftCard.name}`}
          />
        </aside>
        <div className={styles.main}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Данные</h2>
            <GiftCardEditForm giftCard={giftCard} />
          </section>
        </div>
      </div>
    </section>
  )
}
