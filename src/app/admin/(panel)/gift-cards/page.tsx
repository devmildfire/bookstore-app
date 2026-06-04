import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminGiftCards } from '@/api/admin/giftCards'
import { formatPrice } from '@/lib/formatPrice'
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
        <ul className={styles.list}>
          {giftCards.map((g) => (
            <li key={g.id} className={styles.item}>
              <Link href={`/admin/gift-cards/${g.id}`} className={styles.itemLink}>
                <span className={styles.cover}>
                  {g.imageUrl ? (
                    <Image src={g.imageUrl} alt='' fill sizes='48px' className={styles.coverImg} unoptimized />
                  ) : (
                    <span className={styles.coverPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{g.name}</span>
                  <span className={styles.slug}>{g.slug}</span>
                </span>
                <span className={styles.value}>{formatPrice(g.faceValue)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
