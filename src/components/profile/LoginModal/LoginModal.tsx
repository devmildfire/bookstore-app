'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useToast } from '@/contexts/toast'
import { signInWithGoogleAction } from '@/lib/profile/actions'
import styles from './LoginModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginModal({ open, onOpenChange }: Props) {
  const { error: toastError } = useToast()

  async function handleGoogle() {
    const result = await signInWithGoogleAction(window.location.origin)
    if (result.status === 'ok') {
      window.location.href = result.url
      return
    }
    toastError('Google OAuth недоступен', result.message)
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

          <button type='button' className={styles.google} onClick={handleGoogle}>
            Войти через Google
          </button>

          <p className={styles.hint}>Скоро: Яндекс, VK, Telegram</p>

          <Dialog.Close className={styles.close} aria-label='Закрыть'>×</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
