'use client'

import { useState } from 'react'
import { useProfile } from '@/contexts/profile'
import { useToast } from '@/contexts/toast'
import {
  setRecoveryEmailAction,
  signInWithGoogleAction,
} from '@/lib/profile/actions'
import { logoutAction } from '@/lib/auth/actions'
import styles from './SecurityCard.module.scss'

type Props = {
  isAnon: boolean
  userEmail: string | null
  oauthProvider: string | null
}

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string }
  | { kind: 'saved' }

export default function SecurityCard({ isAnon, userEmail, oauthProvider }: Props) {
  const { profile, setProfile } = useProfile()
  const { toast, error: toastError } = useToast()

  const hasRecoveryEmail = !!profile.recoveryEmail
  const [editingEmail, setEditingEmail] = useState(false)
  const [emailValue, setEmailValue] = useState(profile.recoveryEmail ?? '')
  const [saveState, setSaveState] = useState<SaveState>({ kind: 'idle' })
  const [oauthBusy, setOauthBusy] = useState(false)

  async function handleSaveEmail() {
    setSaveState({ kind: 'saving' })
    const result = await setRecoveryEmailAction(emailValue)
    if (result.status === 'ok') {
      setProfile(result.profile)
      setSaveState({ kind: 'saved' })
      setEditingEmail(false)
      setTimeout(() => setSaveState({ kind: 'idle' }), 1500)
    } else {
      setSaveState({ kind: 'error', message: result.message })
    }
  }

  async function handleGoogle() {
    setOauthBusy(true)
    const origin = window.location.origin
    const result = await signInWithGoogleAction(origin)
    setOauthBusy(false)
    if (result.status === 'ok') {
      window.location.href = result.url
    } else {
      toastError('Google OAuth недоступен', result.message)
    }
  }

  function handleStub(name: string) {
    toast({ title: `${name}: скоро`, description: 'Этот способ входа появится позже.' })
  }

  // ─── Real user view ──────────────────────────────────────────────────────
  if (!isAnon) {
    return (
      <section className={styles.card}>
        <h2 className={styles.title}>Доступ и безопасность</h2>
        <p className={styles.copy}>Ваш аккаунт защищён. Доступ работает на любых устройствах.</p>

        <dl className={styles.list}>
          <Row label='Email' value={userEmail ?? '—'} />
          {oauthProvider && <Row label='Вход через' value={capitalize(oauthProvider)} />}
        </dl>

        <form action={logoutAction}>
          <button type='submit' className={styles.logout}>Выйти</button>
        </form>
      </section>
    )
  }

  // ─── Anonymous user view ─────────────────────────────────────────────────
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Доступ и безопасность</h2>
      <p className={styles.copy}>
        Ваш аккаунт держится на куках этого браузера. Привяжите email или
        войдите через сервис — иначе при смене устройства или очистке куки
        доступ к покупкам пропадёт.
      </p>

      <div className={styles.emailBlock}>
        <span className={styles.blockLabel}>Email для восстановления</span>
        {hasRecoveryEmail && !editingEmail ? (
          <div className={styles.savedRow}>
            <span className={styles.savedEmail}>{profile.recoveryEmail}</span>
            <button
              type='button'
              className={styles.linkBtn}
              onClick={() => {
                setEmailValue(profile.recoveryEmail ?? '')
                setEditingEmail(true)
              }}
            >
              Изменить
            </button>
          </div>
        ) : (
          <div className={styles.inputRow}>
            <input
              type='email'
              placeholder='you@example.com'
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              className={styles.input}
              autoComplete='email'
              disabled={saveState.kind === 'saving'}
            />
            <button
              type='button'
              className={styles.saveBtn}
              onClick={handleSaveEmail}
              disabled={saveState.kind === 'saving' || !emailValue.trim()}
            >
              {saveState.kind === 'saving' ? 'Сохраняем…'
                : saveState.kind === 'saved' ? 'Сохранено'
                : 'Сохранить'}
            </button>
            {hasRecoveryEmail && (
              <button
                type='button'
                className={styles.linkBtn}
                onClick={() => {
                  setEmailValue(profile.recoveryEmail ?? '')
                  setEditingEmail(false)
                  setSaveState({ kind: 'idle' })
                }}
              >
                Отмена
              </button>
            )}
          </div>
        )}
        {saveState.kind === 'error' && (
          <p className={styles.error}>{saveState.message}</p>
        )}
      </div>

      <div className={styles.oauthBlock}>
        <span className={styles.blockLabel}>Или войдите через сервис</span>
        <div className={styles.oauthGrid}>
          <button type='button' className={styles.oauthBtn} onClick={handleGoogle} disabled={oauthBusy}>
            Google
          </button>
          <button type='button' className={styles.oauthBtn} onClick={() => handleStub('Yandex')}>
            Yandex
          </button>
          <button type='button' className={styles.oauthBtn} onClick={() => handleStub('VK')}>
            VK
          </button>
          <button type='button' className={styles.oauthBtn} onClick={() => handleStub('Telegram')}>
            Telegram
          </button>
        </div>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={styles.rowValue}>{value}</dd>
    </div>
  )
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
