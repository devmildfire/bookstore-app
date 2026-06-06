import Link from 'next/link'
import cn from 'classnames'
import styles from './AdminPager.module.scss'

// The one pager for every paginated admin list, per the handoff `.pager`:
// centered, bordered «Назад» / «n / total» / «Вперёд», with the unavailable
// direction shown faded (we render a span since a Link can't be disabled).
type Props = {
  page: number
  totalPages: number
  hrefForPage: (page: number) => string
}

export default function AdminPager({ page, totalPages, hrefForPage }: Props) {
  if (totalPages <= 1) return null
  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <nav className={styles.pager} aria-label='Страницы'>
      {prevDisabled ? (
        <span className={cn(styles.btn, styles.disabled)} aria-disabled='true'>
          Назад
        </span>
      ) : (
        <Link href={hrefForPage(page - 1)} className={styles.btn}>
          Назад
        </Link>
      )}
      <span className={styles.info}>
        {page} / {totalPages}
      </span>
      {nextDisabled ? (
        <span className={cn(styles.btn, styles.disabled)} aria-disabled='true'>
          Вперёд
        </span>
      ) : (
        <Link href={hrefForPage(page + 1)} className={styles.btn}>
          Вперёд
        </Link>
      )}
    </nav>
  )
}
