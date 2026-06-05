import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminBooks, type BookStatus } from '@/api/admin/books'
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge'
import { SearchIcon, ChevronRightIcon } from '@/components/admin/icons'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Книги' }

const STATUS_LABEL: Record<BookStatus, string> = {
  draft: 'Черновик',
  published: 'Опубл.',
  archived: 'Архив',
}
const STATUS_TONE: Record<BookStatus, BadgeTone> = {
  draft: 'warning',
  published: 'positive',
  archived: 'neutral',
}

type Props = { searchParams: Promise<{ q?: string; status?: string; page?: string }> }

export default async function AdminBooksPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page) || 1) : 1
  const { books, total, pageSize } = await getAdminBooks({ q: sp.q, status: sp.status, page })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (sp.q) params.set('q', sp.q)
    if (sp.status) params.set('status', sp.status)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/admin/books?${qs}` : '/admin/books'
  }

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Книги</h1>
        <span className={styles.count}>{total} всего</span>
        <Link href='/admin/books/new' className={styles.create}>
          + Создать книгу
        </Link>
      </header>

      <form className={styles.filters} method='get'>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type='search'
            name='q'
            defaultValue={sp.q ?? ''}
            placeholder='Поиск по названию'
            aria-label='Поиск книг'
          />
        </div>
        <select name='status' defaultValue={sp.status ?? ''} className={styles.select} aria-label='Статус'>
          <option value=''>Статус: все</option>
          <option value='published'>Опубликованные</option>
          <option value='draft'>Черновики</option>
          <option value='archived'>В архиве</option>
        </select>
        <button type='submit' className={styles.apply}>
          Найти
        </button>
        {(sp.q || sp.status) && (
          <Link href='/admin/books' className={styles.reset}>
            Сбросить
          </Link>
        )}
      </form>

      {books.length === 0 ? (
        <p className={styles.empty}>Книги не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {books.map((b) => (
            <li key={b.id} className={styles.item}>
              <Link href={`/admin/books/${b.id}`} className={styles.itemLink}>
                <span className={styles.cover}>
                  {b.coverUrl ? (
                    <Image src={b.coverUrl} alt='' fill sizes='48px' className={styles.coverImg} unoptimized />
                  ) : (
                    <span className={styles.coverPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{b.name}</span>
                  <span className={styles.sub}>
                    {b.authorName ? `${b.authorName} · ` : ''}
                    {b.slug ? `/${b.slug}` : '—'}
                  </span>
                </span>
                <span className={styles.badges}>
                  <StatusBadge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</StatusBadge>
                  {b.isFeatured && <StatusBadge tone='accent'>На главной</StatusBadge>}
                </span>
                <ChevronRightIcon className={styles.chevron} />
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className={styles.pager} aria-label='Страницы'>
          {page > 1 && <Link href={pageHref(page - 1)}>← Назад</Link>}
          <span className={styles.pageInfo}>
            {page} / {totalPages}
          </span>
          {page < totalPages && <Link href={pageHref(page + 1)}>Вперёд →</Link>}
        </nav>
      )}
    </section>
  )
}
