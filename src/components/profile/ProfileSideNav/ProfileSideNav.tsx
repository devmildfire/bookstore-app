'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/profile'
import useSupabaseUser from '@/hooks/useSupabaseUser'
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

export default function ProfileSideNav() {
  const pathname = usePathname() ?? ''
  const { profile } = useProfile()
  const { isAnonymous } = useSupabaseUser()
  const [loginOpen, setLoginOpen] = useState(false)

  const avatarSrc = profile.avatarPath
    ? `${avatarPublicUrl(profile.avatarPath)}?v=${encodeURIComponent(profile.updatedAt)}`
    : null

  return (
    <aside className={styles.sidebar} aria-label='Меню кабинета'>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {avatarSrc ? (
            <Image src={avatarSrc} alt='' fill sizes='77px' className={styles.avatarImg} unoptimized />
          ) : (
            <ProfileIcon className={styles.avatarPlaceholder} />
          )}
        </div>
        <span className={styles.nickname}>{profile.nickname}</span>
      </div>

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
        {isAnonymous ? (
          <button type='button' className={styles.cta} onClick={() => setLoginOpen(true)}>
            Войти
          </button>
        ) : (
          <form action={logoutAction}>
            <button type='submit' className={styles.cta}>Выйти</button>
          </form>
        )}
      </div>

      <LoginModal open={loginOpen} onOpenChange={setLoginOpen} />
    </aside>
  )
}
