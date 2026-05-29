import Link from 'next/link'
import GiftCardWalletItem from '@/components/giftCards/GiftCardWalletItem'
import type { GiftCard } from '@/entities/giftCard/client'
import styles from './GiftCardWalletList.module.scss'

type Props = {
  cards: GiftCard[]
}

export default function GiftCardWalletList({ cards }: Props) {
  if (cards.length === 0) {
    return (
      <div className={styles.empty}>
        <p>У вас пока нет карт даров.</p>
        <Link href='/gift-cards'>Перейти к покупке</Link>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {cards.map((card) => (
        <GiftCardWalletItem key={card.id} card={card} />
      ))}
    </div>
  )
}
