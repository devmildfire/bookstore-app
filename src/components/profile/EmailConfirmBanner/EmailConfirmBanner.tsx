'use client'

import { useState, useTransition } from 'react'
import { resendEmailConfirmationAction } from '@/lib/auth/actions'
import { useToast } from '@/contexts/toast'
import styles from './EmailConfirmBanner.module.scss'

interface EmailConfirmBannerProps {
  /** The address awaiting confirmation (pending change or unconfirmed signup). */
  email: string
}

// Soft-gate nudge: shown in the cabinet while the user's email is unconfirmed.
// The account still works; this just prompts confirmation and offers a resend.
export default function EmailConfirmBanner({ email }: EmailConfirmBannerProps) {
  const { success, error } = useToast()
  const [pending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  const onResend = () => {
    startTransition(async () => {
      const result = await resendEmailConfirmationAction()
      if (result.ok) {
        setSent(true)
        success('Письмо отправлено', `Проверьте почту ${email}`)
      } else {
        error('Не удалось отправить', result.error)
      }
    })
  }

  return (
    <div className={styles.banner} role='status'>
      <div className={styles.text}>
        <strong className={styles.title}>Подтвердите email</strong>
        <span className={styles.body}>
          Мы отправили ссылку на <b>{email}</b>. Подтвердите адрес, чтобы завершить создание аккаунта.
        </span>
      </div>
      <button type='button' className={styles.button} onClick={onResend} disabled={pending || sent}>
        {pending ? 'Отправка…' : sent ? 'Отправлено' : 'Отправить ещё раз'}
      </button>
    </div>
  )
}
