'use client'

import { useState } from 'react'
import Modal from '@/components/common/Modal'
import { useToast } from '@/contexts/toast'
import GoogleIcon from '@/assets/icons/google.svg'
import YandexIcon from '@/assets/icons/yandex.svg'
import VkIcon from '@/assets/icons/vk.svg'
import TelegramIcon from '@/assets/icons/telegram.svg'
import styles from './LoginModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)

  function handleGoogle() {
    if (busy) return
    setBusy(true)
    // Plain top-level navigation to a Route Handler. The handler does
    // signInWithOAuth + cookie writes server-side and 302s to Google.
    // No Server Action / RSC stream is involved, so Firefox can't abort
    // a stream mid-read and surface "Error in input stream".
    window.location.assign('/api/auth/google')
  }

  function handleStub(name: string) {
    toast({ title: `${name}: скоро`, description: 'Этот способ входа появится позже.' })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title='Вход'
      description={
        busy
          ? 'Перенаправляем на Google…'
          : 'Войдите, чтобы привязать покупки к вашему аккаунту.'
      }
      size='sm'
    >
      <div className={styles.providers} aria-busy={busy}>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={handleGoogle}
          disabled={busy}
          aria-label='Войти через Google'
        >
          <GoogleIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('Яндекс')}
          disabled={busy}
          aria-label='Войти через Яндекс (скоро)'
        >
          <YandexIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('VK')}
          disabled={busy}
          aria-label='Войти через VK (скоро)'
        >
          <VkIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('Telegram')}
          disabled={busy}
          aria-label='Войти через Telegram (скоро)'
        >
          <TelegramIcon className={styles.providerIcon} />
        </button>
      </div>
    </Modal>
  )
}
