import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminGiftCards } from '@/api/admin/giftCards'
import { formatPrice } from '@/lib/formatPrice'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Карты даров' }

export default async function AdminGiftCardsPage() {
  const giftCards = await getAdminGiftCards()

  return (
    <section className={styles.page}>
      <AdminPageHeader
        title='Карты даров'
        count={`${giftCards.length} всего`}
        createHref='/admin/gift-cards/new'
        createLabel='Создать карту'
      />

      {giftCards.length === 0 ? (
        <p className={styles.empty}>Карты даров не найдены.</p>
      ) : (
        <AdminList>
          {giftCards.map((g) => (
            <AdminRow
              key={g.id}
              href={`/admin/gift-cards/${g.id}`}
              coverUrl={g.imageUrl}
              coverAlt={g.name}
              name={g.name}
              sub={`/${g.slug}`}
              value={formatPrice(g.faceValue)}
            />
          ))}
        </AdminList>
      )}
    </section>
  )
}
