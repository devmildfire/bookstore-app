'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import styles from './ProfileSideNav.module.scss'

type Props = {
  nickname: string
  isAnon: boolean
  userEmail: string | null
}

type NavItem = {
  href: string
  exact: boolean
  label: string
}

export default function ProfileSideNav({ nickname, isAnon, userEmail }: Props) {
  const pathname = usePathname() ?? ''

  const items: NavItem[] = [
    { href: '/profile', exact: true, label: nickname },
    { href: '/profile/orders', exact: false, label: 'Мои книги' },
    { href: '/profile/favorites', exact: false, label: 'Избранное' },
  ]

  return (
    <nav className={styles.nav} aria-label='Меню кабинета'>
      <p className={styles.userLine}>
        {isAnon ? 'Гость' : (userEmail ?? '')}
      </p>
      <ul className={styles.list}>
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(styles.link, active && styles.linkActive)}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
