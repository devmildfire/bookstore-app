'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { getAvatarUrl } from '@/lib/storage'
import { useProfile } from '@/contexts/profile'
import ProfileAuthSlot from '@/components/profile/ProfileAuthSlot'
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

export default function ProfileSideNav({ isAnon, userEmail, provider }: Props) {
  const pathname = usePathname() ?? ''
  const { profile } = useProfile()

  const avatarUrl = getAvatarUrl(profile.avatarPath)
  const avatarSrc = avatarUrl
    ? `${avatarUrl}?v=${encodeURIComponent(profile.updatedAt)}`
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

      {/* Auth slot inside the sidebar — visible on desktop / tablet.
          Hidden at tablet-small via SCSS; the layout renders a separate
          ProfileAuthSlot at the bottom of the page for mobile instead. */}
      <ProfileAuthSlot
        className={styles.ctaSlot}
        isAnon={isAnon}
        userEmail={userEmail}
        provider={provider}
      />
    </aside>
  )
}
