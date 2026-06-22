'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import styles from './EmailConfirmedModal.module.scss'

// Shown once on the first return from an email-confirmation link — the cabinet
// is reached with ?email_confirmed=1 (set by /auth/confirm). Reassures the user
// their address is confirmed and tied to their account.
export default function EmailConfirmedModal() {
  const [open, setOpen] = useState(true)
  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      title='Email подтверждён'
      description='Адрес привязан к вашему аккаунту'
      size='sm'
    >
      <div className={styles.body}>
        <p>
          Готово! Ваш email подтверждён и закреплён за аккаунтом «Чтиво». Теперь покупки и
          доступ сохраняются за вами на любом устройстве — даже если смените браузер.
        </p>
        <Button variant='cta' fitContainer onClick={() => setOpen(false)}>
          Отлично
        </Button>
      </div>
    </Modal>
  )
}
