'use client'

import { useState, useTransition } from 'react'
import Modal from '@/components/common/Modal'
import { useQueryClient } from '@tanstack/react-query'
import { sendGiftCard } from '@/api/giftCards/sendGiftCard'
import { userGiftCardsQueryKey } from '@/api/giftCards/getUserGiftCards'
import { useToast } from '@/contexts/toast'
import styles from './SendGiftCardDialog.module.scss'

type Props = {
  cardId: string
  trigger: React.ReactNode
}

type PendingFlow = null | 'email' | 'link'

export default function SendGiftCardDialog({ cardId, trigger }: Props) {
  const queryClient = useQueryClient()
  const { success, error } = useToast()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [claimUrl, setClaimUrl] = useState<string | null>(null)
  const [flow, setFlow] = useState<PendingFlow>(null)
  const [isPending, startTransition] = useTransition()

  function handleEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending || claimUrl !== null) return
    setFlow('email')
    startTransition(async () => {
      const result = await sendGiftCard(cardId, email)
      if (result.status === 'error') {
        error('Не удалось отправить карту', result.message)
        setFlow(null)
        return
      }
      await queryClient.invalidateQueries({ queryKey: userGiftCardsQueryKey })
      success('Письмо отправлено', email)
      setOpen(false)
    })
  }

  function handleLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isPending || claimUrl !== null) return
    setFlow('link')
    startTransition(async () => {
      const result = await sendGiftCard(cardId, null)
      if (result.status === 'error') {
        error('Не удалось создать ссылку', result.message)
        setFlow(null)
        return
      }
      setClaimUrl(result.claimUrl)
      await queryClient.invalidateQueries({ queryKey: userGiftCardsQueryKey })
      success('Ссылка создана')
    })
  }

  async function handleCopy() {
    if (!claimUrl) return
    await navigator.clipboard.writeText(claimUrl)
    success('Ссылка скопирована')
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setEmail('')
      setClaimUrl(null)
      setFlow(null)
    }
  }

  const disabled = isPending || claimUrl !== null

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title='Отправить карту'
      description='Отправьте карту по email или создайте ссылку и поделитесь ей сами.'
      size='md'
    >
          {claimUrl ? (
            <div className={styles.claimBox}>
              <span className={styles.claimUrl}>{claimUrl}</span>
              <button type='button' className={styles.primary} onClick={handleCopy}>
                Скопировать
              </button>
            </div>
          ) : (
            <>
              <form className={styles.form} onSubmit={handleEmailSubmit}>
                <label className={styles.label}>
                  <span>Email получателя</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className={styles.input}
                    type='email'
                    required
                    placeholder='name@example.com'
                    disabled={disabled}
                  />
                </label>
                <button type='submit' className={styles.primary} disabled={disabled || !email}>
                  {flow === 'email' && isPending ? 'Отправляем…' : 'Отправить'}
                </button>
              </form>

              <hr className={styles.divider} />

              <form className={styles.form} onSubmit={handleLinkSubmit}>
                <p className={styles.linkHint}>Или создайте ссылку и отправьте её самостоятельно.</p>
                <button type='submit' className={styles.secondary} disabled={disabled}>
                  {flow === 'link' && isPending ? 'Создаём…' : 'Создать ссылку'}
                </button>
              </form>
            </>
          )}
    </Modal>
  )
}
