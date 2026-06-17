import Image from 'next/image'
import SendGiftCardDialog from '@/components/giftCards/SendGiftCardDialog'
import CopyClaimLink from './CopyClaimLink'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCard } from '@/entities/giftCard'
import styles from './GiftCardWalletItem.module.scss'

type Props = {
  card: GiftCard
}

const STATUS_LABEL: Record<GiftCard['status'], string> = {
  active: 'активна',
  pending: 'отправлено',
  depleted: 'использовано',
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

// Server component — body renders on the server; the only client islands are the leaf
// <CopyClaimLink> (pending) and <SendGiftCardDialog> (active).
export default function GiftCardWalletItem({ card }: Props) {
  const claimUrl = card.claimToken ? `/redeem/${card.claimToken}` : null

  return (
    <article className={styles.card} data-status={card.status}>
      <div className={styles.imageWrap}>
        {card.productImageUrl ? (
          <Image
            src={card.productImageUrl}
            alt={card.productName}
            fill
            className={styles.image}
            sizes='(max-width: 532px) 80vw, 220px'
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden />
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{card.productName}</h3>

        <div className={styles.balanceRow}>
          <p className={styles.balance}>
            {formatPrice(card.balance)} / {formatPrice(card.faceValue)}
          </p>
          <span className={styles.badge}>{STATUS_LABEL[card.status]}</span>
        </div>

        {card.status === 'pending' && (
          <div className={styles.pending}>
            {card.recipientEmail && <p>Получатель: {card.recipientEmail}</p>}
            {formatDate(card.sentAt) && <p>Отправлено: {formatDate(card.sentAt)}</p>}
            {claimUrl && <CopyClaimLink claimUrl={claimUrl} />}
          </div>
        )}

        {card.status === 'active' && card.balance > 0 && (
          <SendGiftCardDialog
            cardId={card.id}
            trigger={
              <button type='button' className={styles.sendBtn}>
                Отправить в подарок
              </button>
            }
          />
        )}
      </div>
    </article>
  )
}
