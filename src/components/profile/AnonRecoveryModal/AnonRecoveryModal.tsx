'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useToast } from '@/contexts/toast'
import {
  setRecoveryEmailAction,
  signInWithGoogleAction,
} from '@/lib/profile/actions'
import styles from './AnonRecoveryModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string }
  | { kind: 'saved' }

export default function AnonRecoveryModal({ open, onOpenChange }: Props) {
  const { toast, error: toastError } = useToast()
  const [showInput, setShowInput] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<SaveState>({ kind: 'idle' })

  function handleClose() {
    setShowInput(false)
    setEmail('')
    setState({ kind: 'idle' })
    onOpenChange(false)
  }

  async function handleSave() {
    setState({ kind: 'saving' })
    const result = await setRecoveryEmailAction(email)
    if (result.status === 'ok') {
      setState({ kind: 'saved' })
      setTimeout(handleClose, 1200)
      return
    }
    setState({ kind: 'error', message: result.message })
  }

  async function handleGoogle() {
    const result = await signInWithGoogleAction(window.location.origin)
    if (result.status === 'ok') {
      window.location.href = result.url
    } else {
      toastError('Google OAuth недоступен', result.message)
    }
  }

  function handleStub(name: string) {
    toast({ title: `${name}: скоро`, description: 'Этот способ входа появится позже.' })
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-describedby='anon-modal-body'>
          <Dialog.Title className={styles.title}>Между нами говоря…</Dialog.Title>

          <div id='anon-modal-body' className={styles.body}>
            <p>
              У вас на руках заказ под анонимным аккаунтом. Это нормально — сайт ваш,
              правила ваши, мы здесь просто помогаем читать.
            </p>
            <p>
              Одна штука: ваш доступ к скачиванию живёт в куках этого браузера. Если
              вы очистите куки, зайдёте с другого устройства, или просто не заглянете
              к нам в течение 30 дней — доступ к покупкам пропадёт. Файлы у нас
              останутся. А способа доказать, что они ваши, у вас уже не будет.
            </p>
            <p>
              Если эти книги вам читать здесь и сейчас — никаких действий не нужно,
              всё работает.
            </p>
            <p>
              Если хочется иметь возможность вернуться когда-нибудь — оставьте email
              или войдите через сервис. Это бесплатно, ни к чему не обязывает, и
              обещаем не спамить.
            </p>
          </div>

          {showInput ? (
            <div className={styles.emailRow}>
              <input
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.emailInput}
                autoComplete='email'
                disabled={state.kind === 'saving' || state.kind === 'saved'}
              />
              <button
                type='button'
                className={styles.confirm}
                onClick={handleSave}
                disabled={state.kind === 'saving' || state.kind === 'saved' || !email.trim()}
              >
                {state.kind === 'saving' ? 'Сохраняем…'
                  : state.kind === 'saved' ? 'Сохранено'
                  : 'Сохранить'}
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                type='button'
                className={styles.confirm}
                onClick={() => setShowInput(true)}
              >
                Оставить email
              </button>
              <button
                type='button'
                className={styles.cancel}
                onClick={handleClose}
              >
                Я в курсе, спасибо
              </button>
            </div>
          )}

          <div className={styles.oauthBlock}>
            <span className={styles.oauthLabel}>Или войдите через сервис</span>
            <div className={styles.oauthGrid}>
              <button type='button' className={styles.oauthBtn} onClick={handleGoogle}>Google</button>
              <button type='button' className={styles.oauthBtn} onClick={() => handleStub('Yandex')}>Yandex</button>
              <button type='button' className={styles.oauthBtn} onClick={() => handleStub('VK')}>VK</button>
              <button type='button' className={styles.oauthBtn} onClick={() => handleStub('Telegram')}>Telegram</button>
            </div>
          </div>

          {state.kind === 'error' && (
            <p className={styles.error}>{state.message}</p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
