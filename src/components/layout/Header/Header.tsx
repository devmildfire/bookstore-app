'use client'

import Link from 'next/link'
import cn from 'classnames'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { useCart } from '@/contexts/cart'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import { logoutAction } from '@/lib/auth/actions'
import { useState } from 'react'
import menu, { type SubmenuItem } from '@/consts/menuItems'
import styles from './Header.module.scss'
import Logo from '@/assets/images/logo.svg'
import Cart from '@/assets/icons/shop-cart.svg'
import Profile from '@/assets/icons/profile.svg'
import Burger from '@/assets/icons/burger.svg'
import Cross from '@/assets/icons/cross.svg'


export default function Header() {
  const { itemCount } = useCart()
  const { isAnonymous, isLoading } = useSupabaseUser()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href='/' className={styles.logoLink}>
          <Logo className={styles.logo} />
        </Link>

        <nav className={styles.nav} aria-label='Основная навигация'>
          {menu.map((item) => (
            <HeaderNavItem key={item.title} item={item} />
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href='/search' className={styles.iconBtn} aria-label='Поиск'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='#DCDCDC'
              className={styles.icon}
            >
              <g opacity='0.7'>
                <path
                  opacity='0.7'
                  d='M18.0916 16.9084L15 13.8417C16.2001 12.3454 16.7812 10.4461 16.624 8.53446C16.4667 6.62279 15.583 4.84403 14.1546 3.56391C12.7261 2.2838 10.8615 1.59963 8.94408 1.6521C7.02668 1.70457 5.20225 2.48968 3.84593 3.84599C2.48962 5.20231 1.70451 7.02674 1.65204 8.94415C1.59957 10.8615 2.28374 12.7262 3.56385 14.1546C4.84397 15.5831 6.62273 16.4668 8.5344 16.6241C10.4461 16.7813 12.3453 16.2001 13.8416 15L16.9083 18.0667C16.9858 18.1448 17.078 18.2068 17.1795 18.2491C17.2811 18.2914 17.39 18.3132 17.5 18.3132C17.61 18.3132 17.7189 18.2914 17.8205 18.2491C17.922 18.2068 18.0142 18.1448 18.0916 18.0667C18.2418 17.9113 18.3258 17.7037 18.3258 17.4875C18.3258 17.2714 18.2418 17.0638 18.0916 16.9084ZM9.16665 15C8.01292 15 6.88511 14.6579 5.92582 14.0169C4.96654 13.376 4.21886 12.4649 3.77735 11.399C3.33584 10.3331 3.22032 9.16024 3.4454 8.02868C3.67048 6.89713 4.22605 5.85773 5.04186 5.04192C5.85767 4.22611 6.89707 3.67054 8.02862 3.44546C9.16018 3.22038 10.3331 3.3359 11.399 3.77741C12.4649 4.21892 13.3759 4.9666 14.0169 5.92588C14.6579 6.88517 15 8.01299 15 9.16671C15 10.7138 14.3854 12.1975 13.2914 13.2915C12.1975 14.3855 10.7137 15 9.16665 15Z'
                />
              </g>
            </svg>
          </Link>

          <Link
            href='/cart'
            className={styles.iconBtn}
            aria-label={`Корзина, ${itemCount} товаров`}
          >
            <Cart />
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
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
                  <Link href={section.link} className={styles.dropdownLink}>
                    {section.subtitle}
                  </Link>
                </DropdownMenu.Item>
              ) : (
                <>
                  <div className={styles.dropdownSectionTitle}>{section.subtitle}</div>
                  {section.items?.map((subItem) => (
                    <DropdownMenu.Item asChild key={subItem.title}>
                      <Link href={subItem.link} className={styles.dropdownLink}>
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
