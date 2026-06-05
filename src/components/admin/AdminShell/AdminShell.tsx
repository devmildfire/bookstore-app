'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import cn from 'classnames'
import AdminSideNav from '@/components/admin/AdminSideNav'
import { BurgerIcon } from '@/components/admin/icons'
import { adminLogoutAction } from '@/lib/admin/actions'
import type { AdminNavCounts } from '@/api/admin/dashboard'
import styles from './AdminShell.module.scss'

// Top-level section labels for the breadcrumb trail.
const SECTION_LABELS: Record<string, string> = {
  orders: 'Заказы',
  books: 'Книги',
  featured: 'На главной',
  authors: 'Авторы',
  'box-sets': 'Бокс-сеты',
  'gift-cards': 'Карты даров',
  subscriptions: 'Подписки',
  'promo-codes': 'Промокоды',
  articles: 'Статьи',
  submissions: 'Заявки',
  audit: 'Журнал',
}

type Props = {
  userEmail: string | null
  navCounts?: AdminNavCounts
  children: React.ReactNode
}

export default function AdminShell({ userEmail, navCounts, children }: Props) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname() ?? ''
  const section = pathname.split('/')[2] // /admin/<section>/...
  const sectionLabel = section ? SECTION_LABELS[section] : null

  return (
    <div className={cn(styles.shell, navOpen && styles.navOpen)}>
      <AdminSideNav userEmail={userEmail} counts={navCounts} open={navOpen} onNavigate={() => setNavOpen(false)} />
      <button
        type='button'
        className={styles.scrim}
        aria-label='Закрыть меню'
        onClick={() => setNavOpen(false)}
      />

      <div className={styles.body}>
        <header className={styles.topbar}>
          <button
            type='button'
            className={styles.burger}
            aria-label='Меню'
            onClick={() => setNavOpen((v) => !v)}
          >
            <BurgerIcon />
          </button>
          <nav className={styles.crumbs} aria-label='Хлебные крошки'>
            <Link href='/admin'>Чтиво</Link>
            {sectionLabel && (
              <>
                <span className={styles.sep}>/</span>
                <span className={styles.cur}>{sectionLabel}</span>
              </>
            )}
          </nav>
          <div className={styles.spacer} />
          <div className={styles.account}>
            <span className={styles.email}>{userEmail}</span>
            <form action={adminLogoutAction}>
              <button type='submit' className={styles.logout}>
                Выйти
              </button>
            </form>
          </div>
        </header>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  )
}
