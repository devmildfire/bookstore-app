'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import styles from './AdminSideNav.module.scss'

type NavItem = { href: string; label: string; exact?: boolean }

// Admin sections. «Статьи» covers the «Динозавр» magazine (same Articles data),
// so there's no separate Динозавр entry — /admin/dino-magazine redirects there.
const NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin', label: 'Сводка', exact: true },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/books', label: 'Книги' },
  { href: '/admin/featured', label: 'На главной' },
  { href: '/admin/authors', label: 'Авторы' },
  { href: '/admin/box-sets', label: 'Бокс-сеты' },
  { href: '/admin/gift-cards', label: 'Карты даров' },
  { href: '/admin/subscriptions', label: 'Подписки' },
  { href: '/admin/promo-codes', label: 'Промокоды' },
  { href: '/admin/articles', label: 'Статьи (Динозавр)' },
  { href: '/admin/submissions', label: 'Заявки' },
]

export default function AdminSideNav() {
  const pathname = usePathname() ?? ''

  return (
    <aside className={styles.sidebar} aria-label='Разделы админ-панели'>
      <Link href='/admin' className={styles.brand}>
        Чтиво
      </Link>
      <nav className={styles.nav}>
        <ul className={styles.list}>
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(styles.link, active && styles.linkActive)}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <Link href='/' className={styles.backToSite}>
        ← На сайт
      </Link>
    </aside>
  )
}
