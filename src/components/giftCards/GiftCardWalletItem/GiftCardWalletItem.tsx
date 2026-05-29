'use client'

import { useState } from 'react'
import SendGiftCardDialog from '@/components/giftCards/SendGiftCardDialog'
import { useToast } from '@/contexts/toast'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCard } from '@/entities/giftCard/client'
import styles from './GiftCardWalletItem.module.scss'

type Props = {
  card: GiftCard
}

function formatDate(value: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function GiftCardWalletItem({ card }: Props) {
  const { success } = useToast()
  const [isCodeVisible, setIsCodeVisible] = useState(false)
  const claimUrl = card.claimToken ? `/redeem/${card.claimToken}` : null

  async function copy(value: string) {
    await navigator.clipboard.writeText(value)
    success('Скопировано')
  }

  return (
    <article className={styles.card} data-status={card.status}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.name}>{card.productName}</h3>
          <p className={styles.meta}>{formatPrice(card.faceValue)}</p>
        </div>
        <span className={styles.badge}>
          {card.status === 'pending' ? 'отправлено' : card.status === 'depleted' ? 'использовано' : 'активна'}
        </span>
      </header>

      <p className={styles.balance}>Остаток: {formatPrice(card.balance)}</p>

      {card.status === 'pending' ? (
        <div className={styles.pending}>
          {card.recipientEmail && <p>Получатель: {card.recipientEmail}</p>}
          {formatDate(card.sentAt) && <p>Дата: {formatDate(card.sentAt)}</p>}
          {claimUrl && (
            <button type='button' className={styles.copyLine} onClick={() => copy(claimUrl)}>
              {claimUrl}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.codeRow}>
          <span>Код: {isCodeVisible ? card.code : '••••-••••-••••-••••'}</span>
          <button type='button' onClick={() => setIsCodeVisible((value) => !value)}>
            {isCodeVisible ? 'Скрыть' : 'Показать'}
          </button>
          {isCodeVisible && (
            <button type='button' onClick={() => copy(card.code)}>
              Скопировать
            </button>
          )}
        </div>
      )}

      {card.status === 'active' && card.balance > 0 && (
        <SendGiftCardDialog
          cardId={card.id}
          trigger={<button type='button' className={styles.send}>Отправить в подарок</button>}
        />
      )}
    </article>
  )
}
