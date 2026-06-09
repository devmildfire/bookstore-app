'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import {
  DashboardIcon,
  OrdersIcon,
  BooksIcon,
  FeaturedIcon,
  AuthorsIcon,
  BoxSetIcon,
  GiftCardIcon,
  SubscriptionsIcon,
  PromoIcon,
  ArticlesIcon,
  SubmissionsIcon,
  AuditIcon,
  LogoutIcon,
} from '@/components/admin/icons'
import { adminLogoutAction } from '@/lib/admin/actions'
import type { AdminNavCounts } from '@/api/admin/dashboard'
import styles from './AdminSideNav.module.scss'

type CountKey = keyof AdminNavCounts
type NavItem = {
  href: string
  label: string
  Icon: React.FC<React.SVGProps<SVGSVGElement>>
  exact?: boolean
  countKey?: CountKey
}
type NavGroup = { label?: string; items: readonly NavItem[] }

// Admin sections, grouped. «Статьи» covers the «Динозавр» magazine (same Articles
// data), so /admin/dino-magazine redirects there.
const NAV_GROUPS: readonly NavGroup[] = [
  {
    items: [{ href: '/admin', label: 'Сводка', Icon: DashboardIcon, exact: true }],
  },
  {
    label: 'Каталог',
    items: [
      { href: '/admin/books', label: 'Книги', Icon: BooksIcon, countKey: 'books' },
      { href: '/admin/authors', label: 'Авторы', Icon: AuthorsIcon, countKey: 'authors' },
      { href: '/admin/box-sets', label: 'Бокс-сеты', Icon: BoxSetIcon, countKey: 'boxSets' },
      { href: '/admin/awards', label: 'Награды', Icon: FeaturedIcon, countKey: 'awards' },
      { href: '/admin/featured', label: 'На главной', Icon: FeaturedIcon, countKey: 'featured' },
    ],
  },
  {
    label: 'Продажи',
    items: [
      { href: '/admin/orders', label: 'Заказы', Icon: OrdersIcon, countKey: 'ordersToShip' },
      { href: '/admin/promo-codes', label: 'Промокоды', Icon: PromoIcon, countKey: 'promoCodes' },
      { href: '/admin/gift-cards', label: 'Карты даров', Icon: GiftCardIcon, countKey: 'giftCards' },
      { href: '/admin/subscriptions', label: 'Подписки', Icon: SubscriptionsIcon, countKey: 'subscriptions' },
    ],
  },
  {
    label: 'Редакция',
    items: [
      { href: '/admin/articles', label: 'Статьи', Icon: ArticlesIcon, countKey: 'articles' },
      { href: '/admin/submissions', label: 'Заявки', Icon: SubmissionsIcon, countKey: 'submissions' },
      { href: '/admin/audit', label: 'Журнал', Icon: AuditIcon },
    ],
  },
]

type Props = {
  userEmail: string | null
  counts?: AdminNavCounts
  open?: boolean
  onNavigate?: () => void
}

export default function AdminSideNav({ userEmail, counts, open = false, onNavigate }: Props) {
  const pathname = usePathname() ?? ''
  const initial = (userEmail?.[0] ?? 'A').toUpperCase()

  return (
    <aside className={cn(styles.sidebar, open && styles.sidebarOpen)} aria-label='Разделы админ-панели'>
      <Link href='/admin' className={styles.brand} onClick={onNavigate}>
        <span className={styles.brandMark}>
          ЧТИ<b>ВО</b>
        </span>
        <span className={styles.brandTag}>Админ‑панель</span>
      </Link>

      <nav className={styles.nav}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? gi} className={styles.group}>
            {group.label && <p className={styles.groupLabel}>{group.label}</p>}
            <ul className={styles.list}>
              {group.items.map(({ href, label, Icon, exact, countKey }) => {
                const active = exact ? pathname === href : pathname.startsWith(href)
                const count = countKey && counts ? counts[countKey] : 0
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(styles.item, active && styles.itemActive)}
                      aria-current={active ? 'page' : undefined}
                      onClick={onNavigate}
                    >
                      <Icon className={styles.icon} />
                      <span className={styles.itemLabel}>{label}</span>
                      {count > 0 && <span className={styles.count}>{count}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.foot}>
        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden>
            {initial}
          </span>
          <span className={styles.userMeta}>
            <span className={styles.userName}>{userEmail ?? 'Администратор'}</span>
            <span className={styles.userRole}>Администратор</span>
          </span>
          <form action={adminLogoutAction}>
            <button type='submit' className={styles.logout} aria-label='Выйти'>
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
