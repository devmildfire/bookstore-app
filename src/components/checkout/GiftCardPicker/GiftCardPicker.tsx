'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserGiftCards, userGiftCardsQueryKey } from '@/api/giftCards/getUserGiftCards'
import { formatPrice } from '@/lib/formatPrice'
import type { GiftCard } from '@/entities/giftCard/client'
import styles from './GiftCardPicker.module.scss'

export type SelectedGiftCardPayment = {
  id: string
  amount: number
}

type Props = {
  eligibleTotal: number
  onChange: (payments: SelectedGiftCardPayment[]) => void
}

function buildPayments(cards: GiftCard[], selectedIds: ReadonlySet<string>, eligibleTotal: number): SelectedGiftCardPayment[] {
  let remaining = eligibleTotal
  const payments: SelectedGiftCardPayment[] = []

  const selectedCards = cards
    .filter((card) => selectedIds.has(card.id))
    .sort((a, b) => b.balance - a.balance)

  for (const card of selectedCards) {
    if (remaining <= 0) break
    const amount = Math.min(card.balance, remaining)
    if (amount > 0) {
      payments.push({ id: card.id, amount })
      remaining -= amount
    }
  }

  return payments
}

export default function GiftCardPicker({ eligibleTotal, onChange }: Props) {
  const { data } = useQuery({
    queryKey: userGiftCardsQueryKey,
    queryFn: getUserGiftCards,
  })
  // Stable empty fallback: a `= []` default would mint a new array reference
  // on every render while the query is loading, cascading through the memos
  // below and looping the `onChange(payments)` effect into max-depth.
  const cards = useMemo<GiftCard[]>(() => data ?? [], [data])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())

  const activeCards = useMemo(
    () => cards.filter((card) => card.status === 'active' && card.balance > 0),
    [cards]
  )
  const payments = useMemo(
    () => buildPayments(activeCards, selectedIds, eligibleTotal),
    [activeCards, selectedIds, eligibleTotal]
  )
  const appliedTotal = payments.reduce((sum, payment) => sum + payment.amount, 0)

  useEffect(() => {
    onChange(payments)
  }, [onChange, payments])

  function toggle(cardId: string) {
    const next = new Set(selectedIds)
    if (next.has(cardId)) next.delete(cardId)
    else next.add(cardId)
    setSelectedIds(next)
  }

  if (activeCards.length === 0 || eligibleTotal <= 0) return null

  return (
    <section className={styles.picker}>
      <h2 className={styles.title}>Карты даров</h2>
      <p className={styles.summary}>
        Применено: {formatPrice(appliedTotal)} из {formatPrice(eligibleTotal)}
      </p>
      <div className={styles.list}>
        {activeCards.map((card) => {
          const payment = payments.find((item) => item.id === card.id)
          return (
            <label key={card.id} className={styles.item}>
              <input
                type='checkbox'
                checked={selectedIds.has(card.id)}
                onChange={() => toggle(card.id)}
              />
              <span className={styles.itemText}>
                <strong>{card.productName}</strong>
                <span>Остаток: {formatPrice(card.balance)}</span>
              </span>
              {payment && <span className={styles.amount}>−{formatPrice(payment.amount)}</span>}
            </label>
          )
        })}
      </div>
    </section>
  )
}
