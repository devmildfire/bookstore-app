'use client'

import Link from 'next/link'
import cn from 'classnames'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { type MenuItem } from '@/consts/menuItems'
import styles from './Header.module.scss'

// Lazy-mounted (dynamic import) the first time a nav item with a submenu is activated. Until then
// the Header renders a plain SSR <button> trigger, so the ~18 KB gz of Radix dropdown-menu + popper
// never loads on a no-interaction page view (Chrome Coverage: was loaded, ~8% executed). Mounts with
// `defaultOpen` so the activating click/Enter opens it immediately, matching the old behaviour.
export default function NavDropdown({ item, active }: { item: MenuItem; active: boolean }) {
  return (
    <DropdownMenu.Root defaultOpen>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(styles.navTrigger, active && styles.navLinkActive)}
          aria-haspopup='menu'
        >
          {item.title}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.dropdownContent} align='start' sideOffset={4}>
          {item.submenu?.map((section) => (
            <div className={styles.dropdownGroup} key={section.subtitle}>
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
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
