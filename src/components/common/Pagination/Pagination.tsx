import type { ReactNode } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import styles from './Pagination.module.scss'

// The one paginator for the whole app (storefront + admin). Link-based (works in
// Server Components, no router hooks → no CSR bail-out), so the caller supplies
// `hrefForPage`. Two layouts via `variant`:
//   - 'simple'   : «Назад» / «n / total» / «Вперёд» (admin lists)
//   - 'numbered' : numbered pages with ellipsis (storefront)
type Props = {
  page: number
  totalPages: number
  hrefForPage: (page: number) => string
  variant?: 'simple' | 'numbered'
}

export default function Pagination({ page, totalPages, hrefForPage, variant = 'numbered' }: Props) {
  if (totalPages <= 1) return null

  // One control — a <Link>, or a faded <span> when the target is unavailable
  // (a Link can't be disabled).
  function control(
    target: number,
    content: ReactNode,
    opts: { key?: string | number; className?: string; active?: boolean; disabled?: boolean; ariaLabel?: string } = {}
  ) {
    const base = cn(styles.btn, opts.className, { [styles.active]: opts.active })
    if (opts.disabled) {
      return (
        <span key={opts.key} className={cn(base, styles.disabled)} aria-disabled='true' aria-label={opts.ariaLabel}>
          {content}
        </span>
      )
    }
    return (
      <Link
        key={opts.key}
        href={hrefForPage(target)}
        className={base}
        aria-current={opts.active ? 'page' : undefined}
        aria-label={opts.ariaLabel}
      >
        {content}
      </Link>
    )
  }

  if (variant === 'simple') {
    return (
      <nav className={styles.pager} aria-label='Страницы'>
        {control(page - 1, 'Назад', { disabled: page <= 1 })}
        <span className={styles.info}>
          {page} / {totalPages}
        </span>
        {control(page + 1, 'Вперёд', { disabled: page >= totalPages })}
      </nav>
    )
  }

  return (
    <nav className={styles.pagination} aria-label='Страницы'>
      {control(page - 1, <Arrow dir='prev' />, {
        className: styles.arrow,
        disabled: page <= 1,
        ariaLabel: 'Предыдущая страница',
      })}
      {buildPageRange(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          control(p, p, { key: p, active: p === page })
        )
      )}
      {control(page + 1, <Arrow dir='next' />, {
        className: styles.arrow,
        disabled: page >= totalPages,
        ariaLabel: 'Следующая страница',
      })}
    </nav>
  )
}

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width='7' height='12' viewBox='0 0 7 12' fill='none' aria-hidden>
      <path
        d={dir === 'prev' ? 'M6 1L1 6L6 11' : 'M1 1L6 6L1 11'}
        stroke='currentColor'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function buildPageRange(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | null)[] = [1]
  if (current > 3) pages.push(null)
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push(null)
  pages.push(total)
  return pages
}
