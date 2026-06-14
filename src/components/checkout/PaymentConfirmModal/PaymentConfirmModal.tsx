'use client'

import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import { formatPrice } from '@/lib/formatPrice'
import styles from './PaymentConfirmModal.module.scss'

export type PaymentModalState =
  | { kind: 'idle' }
  | { kind: 'processing' }
  | { kind: 'error'; message: string }

type Props = {
  open: boolean
  state: PaymentModalState
  amount: number
  isFullyCovered?: boolean
  appliedCode: string | null
  summary?: string | null // shipping summary string for physical orders
  onConfirm: () => void
  onClose: () => void
}

export default function PaymentConfirmModal({
  open,
  state,
  amount,
  isFullyCovered = false,
  appliedCode,
  summary,
  onConfirm,
  onClose,
}: Props) {
  const processing = state.kind === 'processing'

  function handleOpenChange(next: boolean) {
    if (!next && !processing) onClose()
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title={isFullyCovered ? 'Подтверждение заказа' : 'Подтверждение оплаты'}
      showClose={false}
      size='sm'
    >
      <div className={styles.stack}>
        <div className={styles.body}>
            <div className={styles.amountRow}>
              <span className={styles.amountLabel}>{isFullyCovered ? 'Осталось оплатить:' : 'К оплате:'}</span>
              <span className={styles.amountValue}>{formatPrice(amount)}</span>
            </div>

            {appliedCode && (
              <p className={styles.codeNote}>Применён промокод: <strong>{appliedCode}</strong></p>
            )}

            {summary && <p className={styles.summary}>{summary}</p>}

            {state.kind === 'error' && (
              <p className={styles.error}>{state.message}</p>
            )}
          </div>

          <div className={styles.actions}>
            <Button type='button' variant='primary' size='lg' onClick={onConfirm} loading={processing}>
              {processing
                ? (isFullyCovered ? 'Оформляем заказ…' : 'Обработка платежа…')
                : (isFullyCovered ? 'Оформить заказ' : 'Подтвердить оплату')}
            </Button>
            <Button type='button' variant='secondary' size='lg' onClick={onClose} disabled={processing}>
              Отмена
            </Button>
          </div>
      </div>
    </Modal>
  )
}
