'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useToast } from '@/contexts/toast'
import { signInWithGoogleAction } from '@/lib/profile/actions'
import GoogleIcon from '@/assets/icons/google.svg'
import VkIcon from '@/assets/icons/vk.svg'
import TelegramIcon from '@/assets/icons/telegram.svg'
import styles from './LoginModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginModal({ open, onOpenChange }: Props) {
  const { toast, error: toastError } = useToast()

  async function handleGoogle() {
    const result = await signInWithGoogleAction(window.location.origin)
    if (result.status === 'ok') {
      window.location.href = result.url
      return
    }
    toastError('Google OAuth недоступен', result.message)
  }

  function handleStub(name: string) {
    toast({ title: `${name}: скоро`, description: 'Этот способ входа появится позже.' })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby='login-modal-body'>
          <Dialog.Title className={styles.title}>Вход</Dialog.Title>

          <p id='login-modal-body' className={styles.body}>
            Войдите, чтобы привязать покупки к вашему аккаунту.
          </p>

          <div className={styles.providers}>
            <button
              type='button'
              className={styles.providerBtn}
              onClick={handleGoogle}
              aria-label='Войти через Google'
            >
              <GoogleIcon className={styles.providerIcon} />
            </button>
            <button
              type='button'
              className={styles.providerBtn}
              onClick={() => handleStub('VK')}
              aria-label='Войти через VK (скоро)'
            >
              <VkIcon className={styles.providerIcon} />
            </button>
            <button
              type='button'
              className={styles.providerBtn}
              onClick={() => handleStub('Telegram')}
              aria-label='Войти через Telegram (скоро)'
            >
              <TelegramIcon className={styles.providerIcon} />
            </button>
          </div>

          <Dialog.Close className={styles.close} aria-label='Закрыть'>×</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
