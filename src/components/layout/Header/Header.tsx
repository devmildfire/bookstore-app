'use client'

import Link from 'next/link'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useCart } from '@/contexts/cart'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import { logoutAction } from '@/lib/auth/actions'
import menu from '@/consts/menuItems'
import styles from './Header.module.scss'
import Logo from '@/assets/images/logo.svg'

export default function Header() {
  const { itemCount } = useCart()
  const { isAnonymous, isLoading } = useSupabaseUser()

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
            <svg
              width='18'
              height='18'
              viewBox='0 0 18 18'
              fill='#DCDCDC'
              className={styles.icon}
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M6 0.333496C5.82319 0.333496 5.65362 0.403734 5.5286 0.528758C5.40357 0.653782 5.33333 0.823352 5.33333 1.00016C5.33333 1.17697 5.40357 1.34654 5.5286 1.47157C5.65362 1.59659 5.82319 1.66683 6 1.66683H16V16.3335H6C5.82319 16.3335 5.65362 16.4037 5.5286 16.5288C5.40357 16.6538 5.33333 16.8234 5.33333 17.0002C5.33333 17.177 5.40357 17.3465 5.5286 17.4716C5.65362 17.5966 5.82319 17.6668 6 17.6668H16C16.3536 17.6668 16.6928 17.5264 16.9428 17.2763C17.1929 17.0263 17.3333 16.6871 17.3333 16.3335V1.66683C17.3333 1.31321 17.1929 0.974069 16.9428 0.72402C16.6928 0.473972 16.3536 0.333496 16 0.333496H6ZM8.80533 5.52816C8.74335 5.46618 8.66976 5.41701 8.58878 5.38346C8.50779 5.34992 8.42099 5.33265 8.33333 5.33265C8.24567 5.33265 8.15887 5.34992 8.07789 5.38346C7.9969 5.41701 7.92332 5.46618 7.86133 5.52816C7.79935 5.59015 7.75018 5.66373 7.71663 5.74472C7.68309 5.8257 7.66582 5.9125 7.66582 6.00016C7.66582 6.08782 7.68309 6.17462 7.71663 6.25561C7.75018 6.33659 7.79935 6.41018 7.86133 6.47216L9.724 8.3335H0.666667C0.489856 8.3335 0.320286 8.40373 0.195262 8.52876C0.0702379 8.65378 0 8.82335 0 9.00016C0 9.17697 0.0702379 9.34654 0.195262 9.47157C0.320286 9.59659 0.489856 9.66683 0.666667 9.66683H9.724L7.86133 11.5282C7.73615 11.6533 7.66582 11.8231 7.66582 12.0002C7.66582 12.1772 7.73615 12.347 7.86133 12.4722C7.98652 12.5973 8.1563 12.6677 8.33333 12.6677C8.51037 12.6677 8.68015 12.5973 8.80533 12.4722L11.8053 9.47216C11.8674 9.41024 11.9167 9.33667 11.9503 9.25567C11.9839 9.17468 12.0012 9.08785 12.0012 9.00016C12.0012 8.91247 11.9839 8.82564 11.9503 8.74465C11.9167 8.66366 11.8674 8.59009 11.8053 8.52816L8.80533 5.52816Z'
              />
            </svg>
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {!isLoading && !isAnonymous && (
            <form action={logoutAction}>
              <button type='submit' className={styles.iconBtn} aria-label='Выйти'>
                <svg
                  width='16'
                  height='18'
                  viewBox='0 0 16 18'
                  fill='none'
                  stroke='#DCDCDC'
                  className={styles.icon}
                >
                  <path
                    d='M4.25 4.625C4.25 4.625 4.25 0.875 8 0.875C11.75 0.875 11.75 4.625 11.75 4.625M1.125 4.625V17.125H14.875V4.625H1.125Z'
                    stroke='#DCDCDC'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </form>
          )}
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

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <div className={styles.dropdownGroup}>{children}</div>
}
