import Link from 'next/link'
import styles from './AuthorsSidebar.module.scss'

export type AuthorsNavKey = 'manuscript' | 'story' | 'abzac'

type NavItem = {
  key: AuthorsNavKey
  label: string
  href: string
}

const ITEMS: NavItem[] = [
  { key: 'manuscript', label: 'Отправить рукопись',          href: '/suggest-manuscript' },
  { key: 'story',      label: 'Отправить рассказ для журнала', href: '/suggest-story-to-rd' },
  { key: 'abzac',      label: 'Мастерская Абзац',            href: '/abzac' },
]

type Props = {
  active: AuthorsNavKey
}

export default function AuthorsSidebar({ active }: Props) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.heading}>Авторам</h2>
      <ul className={styles.list}>
        {ITEMS.map((item) => {
          const isActive = item.key === active
          return (
            <li key={item.key} className={isActive ? styles.itemActive : styles.item}>
              <Link href={item.href} className={styles.link}>{item.label}</Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
