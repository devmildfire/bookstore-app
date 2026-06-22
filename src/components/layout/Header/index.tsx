'use client'

import Link from 'next/link'
import cn from '@/utils/cn'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useCart } from '@/contexts/cart'
import { useState, useCallback } from 'react'
import menu, { type MenuItem } from '@/consts/menuItems'
import HeaderSearchBar from '@/components/layout/HeaderSearchBar'
import CartIconBadge from '@/components/common/CartIconBadge'
import styles from './Header.module.scss'
import Logo from '@/assets/images/logo.svg'
import Profile from '@/assets/icons/profile.svg'
import Burger from '@/assets/icons/burger.svg'
import SearchIcon from '@/assets/icons/search.svg'

// Radix dropdown (popper + dropdown-menu) and dialog are loaded lazily, on first interaction, so a
// no-interaction page view (e.g. the Lighthouse trace) ships none of it — ~26 KB gz off the
// critical path with no a11y loss. See ./NavDropdown and ./MobileMenu.
const NavDropdown = dynamic(() => import('./NavDropdown'))
const MobileMenu = dynamic(() => import('./MobileMenu'))

export default function Header() {
  const { itemCount } = useCart()
  const [mobileMenuArmed, setMobileMenuArmed] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  const handleSearchExpand = useCallback(() => setSearchExpanded(true), [])
  const handleSearchCollapse = useCallback(() => setSearchExpanded(false), [])

  return (
    <header className={styles.header}>
      <div className={cn(styles.inner, searchExpanded && styles.searchExpanded)}>
        <Link href='/' aria-label='Чтиво — на главную' className={cn(styles.logoLink, searchExpanded && styles.hiddenOnPhone)}>
          <Logo className={styles.logo} />
        </Link>

        <nav className={cn(styles.nav, searchExpanded && styles.hiddenOnPhone)} aria-label='Основная навигация'>
          {menu.map((item) => (
            <HeaderNavItem key={item.title} item={item} />
          ))}
        </nav>

        <HeaderSearchBar
          expanded={searchExpanded}
          onExpand={handleSearchExpand}
          onCollapse={handleSearchCollapse}
        />

        <div className={cn(styles.actions, searchExpanded && styles.hiddenOnPhone)}>
          <button
            type='button'
            className={cn(styles.iconBtn, styles.searchMobileBtn)}
            onClick={handleSearchExpand}
            aria-label='Поиск'
          >
            <SearchIcon className={styles.searchMobileIcon} />
          </button>

          <Link
            href='/cart'
            className={styles.iconBtn}
            aria-label={`Корзина, ${itemCount} товаров`}
          >
            <CartIconBadge variant='header' />
          </Link>

          <Link href='/profile' className={styles.iconBtn} aria-label='Личный кабинет'>
            <Profile className={styles.profile} />
          </Link>

          {/* Plain SSR trigger until first tap; then the Radix dialog menu mounts (already open). */}
          {mobileMenuArmed ? (
            <MobileMenu buttonClassName={cn(styles.iconBtn, styles.mobileOnly)} />
          ) : (
            <button
              type='button'
              className={cn(styles.iconBtn, styles.mobileOnly)}
              onClick={() => setMobileMenuArmed(true)}
              aria-label='Открыть меню'
            >
              <Burger className={styles.burger} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

// Every route a top-level menu item points at — its own link, or every link
// inside its dropdown — so the item highlights while you're on any of them.
function collectLinks(item: MenuItem): string[] {
  if (item.link) return [item.link]
  const links: string[] = []
  for (const section of item.submenu ?? []) {
    if (section.link) links.push(section.link)
    for (const sub of section.items ?? []) links.push(sub.link)
  }
  return links
}

function isPathActive(pathname: string, link: string): boolean {
  return pathname === link || pathname.startsWith(`${link}/`)
}

function HeaderNavItem({ item }: { item: MenuItem }) {
  const pathname = usePathname()
  const active = collectLinks(item).some((link) => isPathActive(pathname, link))
  const [armed, setArmed] = useState(false)

  if (item.link) {
    return (
      <Link
        href={item.link}
        className={cn(styles.navLink, active && styles.navLinkActive)}
        aria-current={active ? 'page' : undefined}
      >
        {item.title}
      </Link>
    )
  }

  // Until armed: plain SSR button. Warm the dropdown chunk on hover/focus so the opening
  // click/Enter resolves it instantly; the click itself arms + (via NavDropdown's defaultOpen) opens.
  if (!armed) {
    return (
      <button
        className={cn(styles.navTrigger, active && styles.navLinkActive)}
        aria-haspopup='menu'
        onPointerEnter={() => void import('./NavDropdown')}
        onFocus={() => void import('./NavDropdown')}
        onClick={() => setArmed(true)}
      >
        {item.title}
      </button>
    )
  }

  return <NavDropdown item={item} active={active} />
}
