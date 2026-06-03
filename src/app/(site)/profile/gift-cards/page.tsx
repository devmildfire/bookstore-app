import type { Metadata } from 'next'
import { getUserGiftCardsServer } from '@/api/giftCards/getUserGiftCardsServer'
import GiftCardWalletList from '@/components/giftCards/GiftCardWalletList'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Карты даров',
  description: 'Карты даров в личном кабинете Чтива.',
  openGraph: {
    title: 'Карты даров',
    description: 'Карты даров в личном кабинете Чтива.',
  },
}

export default async function ProfileGiftCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ redeemed?: string; redeem_error?: string }>
}) {
  const params = await searchParams
  const cards = await getUserGiftCardsServer()

  return (
    <section className={styles.page}>
      <h2 className={styles.title}>Карты даров</h2>
      {params.redeemed && <p className={styles.notice}>Карта добавлена в ваш кабинет.</p>}
      {params.redeem_error && <p className={styles.error}>Ссылка недействительна или уже использована.</p>}
      <GiftCardWalletList cards={cards} />
    </section>
  )
}
