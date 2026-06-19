'use client'

import { useState } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import * as Dialog from '@radix-ui/react-dialog'
import menu, { type MenuItem, type SubmenuItem } from '@/consts/menuItems'
import styles from './Header.module.scss'
import Burger from '@/assets/icons/burger.svg'
import Cross from '@/assets/icons/cross.svg'

// Lazy-mounted (dynamic import) on the first hamburger tap, so the ~8.5 KB gz of Radix dialog +
// react-remove-scroll + focus-scope never loads on a no-interaction page view (Chrome Coverage:
// was loaded, ~6% executed). The Header renders a plain SSR <button> until then; this component
// mounts with the dialog already open (the tap that armed it) and renders its own trigger so the
// hamburger keeps toggling afterwards.
export default function MobileMenu({ buttonClassName }: { buttonClassName: string }) {
  const [open, setOpen] = useState(true)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type='button'
          className={buttonClassName}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        >
          {open ? <Cross className={styles.cross} /> : <Burger className={styles.burger} />}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.mobileMenuOverlay} />
        <Dialog.Content className={styles.mobileMenuContent}>
          <Dialog.Title className={styles.mobileMenuTitle}>Меню</Dialog.Title>

          <nav className={styles.mobileMenuNav} aria-label='Мобильная навигация'>
            {menu.map((item) => (
              <MobileNavItem key={item.title} item={item} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function MobileNavItem({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
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
        type='button'
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
    <Link href={section.link ?? '#'} className={styles.mobileSubmenuSectionLink} onClick={onNavigate}>
      {section.subtitle}
    </Link>
  )
}
