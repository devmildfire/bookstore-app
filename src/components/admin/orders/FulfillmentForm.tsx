'use client'

import { useActionState } from 'react'
import { setOrderFulfillmentAction } from '@/lib/admin/orders/actions'
import Button from '@/components/common/Button'
import AdminSelect from '@/components/admin/AdminSelect'
import { CheckIcon } from '@/components/admin/icons'
import type { FulfillmentStatus } from '@/entities/order/client'
import styles from './FulfillmentForm.module.scss'

const OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'В пути' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'completed', label: 'Выполнен' },
]

type Props = {
  orderId: number
  current: FulfillmentStatus
  trackingNumber: string | null
  trackingCarrier: string | null
  adminNote: string | null
}

export default function FulfillmentForm({ orderId, current, trackingNumber, trackingCarrier, adminNote }: Props) {
  const [state, action, pending] = useActionState(setOrderFulfillmentAction, null)

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='orderId' value={orderId} />

      <div className={styles.label}>
        <span>Статус доставки</span>
        <AdminSelect name='status' defaultValue={current} options={OPTIONS} ariaLabel='Статус доставки' />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Трек-номер
          <input
            type='text'
            name='trackingNumber'
            defaultValue={trackingNumber ?? ''}
            className={styles.input}
            placeholder='напр. RU123456789'
          />
        </label>
        <label className={styles.label}>
          Служба доставки
          <input
            type='text'
            name='carrier'
            defaultValue={trackingCarrier ?? ''}
            className={styles.input}
            placeholder='напр. СДЭК, Почта России'
          />
        </label>
      </div>

      <label className={styles.label}>
        Внутренняя заметка
        <textarea name='note' defaultValue={adminNote ?? ''} className={styles.textarea} rows={3} />
      </label>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && (
          <span className={styles.ok}>
            <CheckIcon /> Сохранено
          </span>
        )}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
