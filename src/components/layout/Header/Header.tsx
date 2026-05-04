'use client'

import Link from 'next/link'
import cn from 'classnames'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { useCart } from '@/contexts/cart'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import { logoutAction } from '@/lib/auth/actions'
import { useState, useCallback } from 'react'
import menu, { type SubmenuItem } from '@/consts/menuItems'
import HeaderSearchBar from '@/components/layout/HeaderSearchBar'
import styles from './Header.module.scss'
import Logo from '@/assets/images/logo.svg'
import Cart from '@/assets/icons/shop-cart.svg'
import Profile from '@/assets/icons/profile.svg'
import Burger from '@/assets/icons/burger.svg'
import Cross from '@/assets/icons/cross.svg'
import SearchIcon from '@/assets/icons/search.svg'

export default function Header() {
  const { itemCount } = useCart()
  const { isAnonymous, isLoading } = useSupabaseUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  const handleSearchExpand = useCallback(() => setSearchExpanded(true), [])
  const handleSearchCollapse = useCallback(() => setSearchExpanded(false), [])

  return (
    <header className={styles.header}>
      <div className={cn(styles.inner, searchExpanded && styles.searchExpanded)}>
        <Link href='/' className={cn(styles.logoLink, searchExpanded && styles.hiddenOnPhone)}>
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
            <Cart className={styles.cart} />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
            )}
          </Link>

          {!isLoading && (
            <form action={logoutAction}>
              <button type='submit' className={styles.iconBtn} aria-label='Выйти'>
                <Profile className={styles.profile}/>
              </button>
            </form>
          )}

          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className={cn(styles.iconBtn, styles.mobileOnly)}
                aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              >
                {mobileMenuOpen
                  ? <Cross className={styles.cross} />
                  : <Burger className={styles.burger}/>
                }
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className={styles.mobileMenuOverlay} />
              <Dialog.Content className={styles.mobileMenuContent}>
                <Dialog.Title className={styles.mobileMenuTitle}>
                  Меню
                </Dialog.Title>

                <nav className={styles.mobileMenuNav} aria-label="Мобильная навигация">
                  {menu.map((item) => (
                    <MobileNavItem
                      key={item.title}
                      item={item}
                      onNavigate={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  )
}

function HeaderNavItem({ item }: { item: typeof menu[number] }) {
  if (item.link) {
    return (
      <Link href={item.link} className={styles.navLink}>
        {item.title}
      </Link>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className={styles.navTrigger} aria-expanded='false' aria-haspopup='menu'>
          {item.title}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.dropdownContent} align='start' sideOffset={4}>
          {item.submenu?.map((section) => (
            <DropdownMenuGroup key={section.subtitle}>
              {section.link ? (
                <DropdownMenu.Item asChild>
                  <Link href={section.link} className={styles.dropdownSectionLink}>
                    {section.subtitle}
                  </Link>
                </DropdownMenu.Item>
              ) : (
                <>
                  <div className={styles.dropdownSectionTitle}>{section.subtitle}</div>
                  {section.items?.map((subItem) => (
                    <DropdownMenu.Item asChild key={subItem.title}>
                      <Link href={subItem.link} className={styles.dropdownSubLink}>
                        {subItem.title}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                </>
              )}
            </DropdownMenuGroup>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function MobileNavItem({ item, onNavigate }: { item: typeof menu[number]; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState(false)

  if (item.link) {
    return (
      <div className={styles.mobileNavItem}>
        <Link href={item.link} className={styles.mobileNavLink} onClick={onNavigate}>
          {item.title}
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.mobileNavItem}>
      <button
        type="button"
        className={styles.mobileNavTrigger}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {item.title}
      </button>
      {expanded && item.submenu && (
        <div className={styles.mobileSubmenu}>
          {item.submenu.map((section) => (
            <MobileSubmenuSection key={section.subtitle} section={section} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  )
}

function MobileSubmenuSection({
  section,
  onNavigate,
}: {
  section: SubmenuItem
  onNavigate: () => void
}) {
  if (section.items) {
    return (
      <div className={styles.mobileSubmenuSection}>
        <div className={styles.mobileSubmenuSectionTitle}>{section.subtitle}</div>
        {section.items.map((subItem) => (
          <Link
            key={subItem.title}
            href={subItem.link}
            className={styles.mobileSubmenuLink}
            onClick={onNavigate}
          >
            {subItem.title}
          </Link>
        ))}
      </div>
    )
  }

  return (
    <Link
      href={section.link ?? '#'}
      className={styles.mobileSubmenuSectionLink}
      onClick={onNavigate}
    >
      {section.subtitle}
    </Link>
  )
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div className={styles.dropdownGroup}>{children}</div>
}