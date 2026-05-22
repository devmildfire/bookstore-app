'use client'

import { useState } from 'react'
import { logoutAction } from '@/lib/auth/actions'
import LoginModal from '@/components/profile/LoginModal'
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

// The notice + Войти/Выйти button. Lives at the bottom of the sidebar on
// desktop (where ProfileSideNav embeds it) and at the bottom of the page
// on mobile (where ProfileLayout renders it as a separate grid row).
// Same component used in both spots — the layout SCSS picks which
// instance is visible at which breakpoint via display: none.
export default function ProfileAuthSlot({ isAnon, userEmail, provider, className }: Props) {
  const [loginOpen, setLoginOpen] = useState(false)

  const providerLine =
    provider && provider !== 'email'
      ? `Вход через ${PROVIDER_LABEL[provider] ?? provider}`
      : 'Вход по email'

  return (
    <div className={className}>
      {isAnon ? (
        <>
          <p className={styles.notice}>
            Сейчас вы без аккаунта. Покупки и доступ к книгам живут только
            в этом браузере — при очистке cookies или переходе на другое
            устройство они пропадут.
          </p>
          <button type='button' className={styles.cta} onClick={() => setLoginOpen(true)}>
            Войти
          </button>
        </>
      ) : (
        <>
          <div className={styles.notice}>
            <p className={styles.noticeMethod}>{providerLine}</p>
            {userEmail && <p className={styles.noticeEmail}>{userEmail}</p>}
            <p>
              Доступ к покупкам открыт на любом устройстве, где вы войдёте
              через этот аккаунт.
            </p>
          </div>
          <form action={logoutAction}>
            <button type='submit' className={styles.cta}>Выйти</button>
          </form>
        </>
      )}
      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </div>
  )
}
