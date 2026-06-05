import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminGiftCards } from '@/api/admin/giftCards'
import { formatPrice } from '@/lib/formatPrice'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Карты даров' }

export default async function AdminGiftCardsPage() {
  const giftCards = await getAdminGiftCards()

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Карты даров</h1>
        <span className={styles.count}>{giftCards.length} всего</span>
        <Link href='/admin/gift-cards/new' className={styles.create}>
          + Создать карту
        </Link>
      </header>

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
