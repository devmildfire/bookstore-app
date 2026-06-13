'use client'

import { useActionState } from 'react'
import { setOrderFulfillmentAction } from '@/lib/admin/orders/actions'
import Button from '@/components/common/Button'
import Select from '@/components/common/Select'
import { CheckIcon } from '@/components/common/icons'
import type { FulfillmentStatus } from '@/entities/order/client'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
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
        <Select name='status' defaultValue={current} options={OPTIONS} ariaLabel='Статус доставки' />
      </div>

      <div className={styles.row}>
        <label className={styles.label}>
          Трек-номер
          <Input
            type='text'
            name='trackingNumber'
            defaultValue={trackingNumber ?? ''}
            placeholder='напр. RU123456789'
          />
        </label>
        <label className={styles.label}>
          Служба доставки
          <Input
            type='text'
            name='carrier'
            defaultValue={trackingCarrier ?? ''}
            placeholder='напр. СДЭК, Почта России'
          />
        </label>
      </div>

      <label className={styles.label}>
        Внутренняя заметка
        <Textarea name='note' defaultValue={adminNote ?? ''} rows={3} />
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
