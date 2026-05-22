'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/profile'
import { logoutAction } from '@/lib/auth/actions'
import LoginModal from '@/components/profile/LoginModal'
import BookIcon from '@/assets/icons/book.svg'
import HeartIcon from '@/assets/icons/heart.svg'
import FeatherIcon from '@/assets/icons/feather.svg'
import ProfileIcon from '@/assets/icons/profile.svg'
import styles from './ProfileSideNav.module.scss'

type NavItem = {
  href: string
  exact: boolean
  label: string
  Icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: readonly NavItem[] = [
  { href: '/profile/orders', exact: false, label: 'Мои книги', Icon: BookIcon },
  { href: '/profile/favorites', exact: false, label: 'Избранное', Icon: HeartIcon },
  // /suggest-manuscript is the existing "Стать автором" stub; replaced when the real page lands.
  { href: '/suggest-manuscript', exact: false, label: 'Стать автором', Icon: FeatherIcon },
]

function avatarPublicUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

type Props = {
  // Server-determined: layout reads the HttpOnly auth cookies in
  // ProfileLayout and passes the resolved state down. We can't compute
  // this client-side because `encode: 'tokens-only'` means the user is
  // in HttpOnly cookies the browser JS cannot read.
  isAnon: boolean
  userEmail: string | null
  // user.app_metadata.provider from Supabase — 'google', 'yandex', 'vk',
  // 'telegram', or 'email' for email/password. null for anon users.
  provider: string | null
}

// Map supabase provider strings to display labels for the info row.
const PROVIDER_LABEL: Record<string, string> = {
  google: 'Google',
  yandex: 'Яндекс',
  vk: 'VK',
  telegram: 'Telegram',
}

export default function ProfileSideNav({ isAnon, userEmail, provider }: Props) {
  const pathname = usePathname() ?? ''
  const { profile } = useProfile()
  const [loginOpen, setLoginOpen] = useState(false)

  const providerLine =
    provider && provider !== 'email'
      ? `Вход через ${PROVIDER_LABEL[provider] ?? provider}`
      : 'Вход по email'

  const avatarSrc = profile.avatarPath
    ? `${avatarPublicUrl(profile.avatarPath)}?v=${encodeURIComponent(profile.updatedAt)}`
    : null

  return (
    <aside className={styles.sidebar} aria-label='Меню кабинета'>
      <Link href='/profile' className={styles.header} aria-label='К профилю'>
        <div className={styles.avatar}>
          {avatarSrc ? (
            <Image src={avatarSrc} alt='' fill sizes='78px' className={styles.avatarImg} unoptimized />
          ) : (
            <ProfileIcon className={styles.avatarPlaceholder} />
          )}
        </div>
        <span className={styles.nickname}>{profile.nickname}</span>
      </Link>

      <nav className={styles.nav}>
        <ul className={styles.list}>
          {NAV_ITEMS.map(({ href, exact, label, Icon }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(styles.link, active && styles.linkActive)}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={styles.linkIcon} />
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className={styles.ctaSlot}>
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
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </aside>
  )
}
