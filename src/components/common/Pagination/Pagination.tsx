'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import cn from 'classnames'
import styles from './Pagination.module.scss'

type Props = {
  page: number
  totalPages: number
  paramName?: string
}

export default function Pagination({ page, totalPages, paramName = 'page' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function goTo(target: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (target === 1) {
      params.delete(paramName)
    } else {
      params.set(paramName, String(target))
    }
    const query = params.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }

  const pages = buildPageRange(page, totalPages)

  return (
    <nav className={styles.pagination} aria-label='Страницы'>
      <button
        className={cn(styles.btn, styles.arrow)}
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label='Предыдущая страница'
      >
        <svg width='7' height='12' viewBox='0 0 7 12' fill='none' aria-hidden>
          <path d='M6 1L1 6L6 11' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === null ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            className={cn(styles.btn, { [styles.active]: p === page })}
            onClick={() => goTo(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        className={cn(styles.btn, styles.arrow)}
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label='Следующая страница'
      >
        <svg width='7' height='12' viewBox='0 0 7 12' fill='none' aria-hidden>
          <path d='M1 1L6 6L1 11' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      </button>
    </nav>
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
