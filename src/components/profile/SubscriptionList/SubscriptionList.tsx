'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  cancelSubscriptionAction,
  chargeSubscriptionNowAction,
  type SubscriptionActionResult,
} from '@/lib/payments/actions'
import type { UserSubscription } from '@/api/subscriptions/getUserSubscriptionsServer'
import { formatProductPrice } from '@/lib/formatPrice'
import styles from './SubscriptionList.module.scss'

const STATUS_LABEL: Record<string, string> = {
  active: 'Активна',
  cancelled: 'Отменена',
  past_due: 'Просрочена',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

type Props = {
  subscriptions: UserSubscription[]
  /** Mock provider only — shows the test "charge now" control. */
  canChargeNow: boolean
}

export default function SubscriptionList({ subscriptions, canChargeNow }: Props) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  if (subscriptions.length === 0) {
    return <p className={styles.empty}>Пока ничего нет</p>
  }

  async function run(id: number, action: (id: number) => Promise<SubscriptionActionResult>) {
    setBusyId(id)
    await action(id)
    setBusyId(null)
    startTransition(() => router.refresh())
  }

  return (
    <ul className={styles.list}>
      {subscriptions.map((sub) => {
        const active = sub.status === 'active'
        const busy = busyId === sub.id
        return (
          <li key={sub.id} className={styles.card}>
            <div className={styles.info}>
              <span className={styles.name}>{sub.planName}</span>
              <span className={styles.meta}>
                {formatProductPrice(sub.amount)} / мес · {STATUS_LABEL[sub.status] ?? sub.status}
              </span>
              {active && (
                <span className={styles.next}>
                  Следующее списание: {formatDate(sub.nextChargeAt)}
                </span>
              )}
            </div>

            {active && (
              <div className={styles.actions}>
                {canChargeNow && (
                  <button
                    type='button'
                    disabled={busy}
                    onClick={() => run(sub.id, chargeSubscriptionNowAction)}
                    className={styles.chargeBtn}
                  >
                    Списать сейчас
                  </button>
                )}
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => run(sub.id, cancelSubscriptionAction)}
                  className={styles.cancelBtn}
                >
                  Отменить
                </button>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
