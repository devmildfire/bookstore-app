'use client'

import { useState } from 'react'
import { logoutAction } from '@/lib/auth/actions'
import LoginModal from '@/components/profile/LoginModal'
import LockIcon from '@/assets/icons/lock.svg'
import SignOutIcon from '@/assets/icons/sign-out.svg'
import styles from './ProfileAuthSlot.module.scss'

type Props = {
  isAnon: boolean
  userEmail: string | null
  provider: string | null
  className?: string
}

const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  yandex: 'Яндекс',
  vk: 'VK',
  telegram: 'Telegram',
}

// The login-method notice + sign-in / sign-out affordance. Lives at the bottom
// of the sidebar on desktop (where ProfileSideNav embeds it) and at the bottom
// of the page on mobile (where ProfileLayout renders it as a separate row).
// Always tells the user *how* they're signed in.
export default function ProfileAuthSlot({ isAnon, userEmail, provider, className }: Props) {
  const [loginOpen, setLoginOpen] = useState(false)

  if (isAnon) {
    return (
      <div className={className}>
        <p className={styles.anonNotice}>
          Сейчас вы без аккаунта. Покупки и доступ к книгам живут только
          в этом браузере — при очистке cookies или переходе на другое
          устройство они пропадут.
        </p>
        <div className={styles.anonRow}>
          <button type='button' className={styles.btn} onClick={() => setLoginOpen(true)}>
            Войти
          </button>
        </div>
        <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
      </div>
    )
  }

  // provider null / 'email' = signed in with email + password.
  const isEmail = !provider || provider === 'email'
  const methodLine = isEmail
    ? 'Вход по email и паролю'
    : `Вход через ${PROVIDER_LABEL[provider] ?? provider}`
  const note = isEmail
    ? 'Вы вошли с помощью email и пароля. Профиль и доступ к покупкам привязаны к этому аккаунту и открываются на любом устройстве, где вы войдёте этим способом.'
    : 'Доступ к покупкам открыт на любом устройстве, где вы войдёте через этот аккаунт.'

  return (
    <div className={className}>
      <div className={styles.login}>
        <div className={styles.loginHead}>
          <LockIcon className={styles.loginIcon} />
          <span>{methodLine}</span>
        </div>
        <p className={styles.loginNote}>{note}</p>
      </div>
      <div className={styles.acct}>
        <span className={styles.acctName}>{userEmail}</span>
        <form action={logoutAction}>
          <button type='submit' className={styles.acctOut} aria-label='Выйти' title='Выйти'>
            <SignOutIcon className={styles.acctOutIcon} />
          </button>
        </form>
      </div>
    </div>
  )
}
