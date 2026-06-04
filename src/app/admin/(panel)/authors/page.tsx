import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminAuthors } from '@/api/admin/authors'
import styles from './page.module.scss'

export const metadata: Metadata = { title: 'Авторы' }

type Props = { searchParams: Promise<{ q?: string; page?: string }> }

export default async function AdminAuthorsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page = sp.page ? Math.max(1, Number(sp.page) || 1) : 1
  const { authors, total, pageSize } = await getAdminAuthors({ q: sp.q, page })
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pageHref = (p: number) => {
    const params = new URLSearchParams()
    if (sp.q) params.set('q', sp.q)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/admin/authors?${qs}` : '/admin/authors'
  }

  return (
    <section className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>Авторы</h1>
        <span className={styles.count}>{total} всего</span>
        <Link href='/admin/authors/new' className={styles.create}>
          + Создать автора
        </Link>
      </header>

      <form className={styles.filters} method='get'>
        <input
          type='search'
          name='q'
          defaultValue={sp.q ?? ''}
          placeholder='Поиск по имени'
          className={styles.search}
          aria-label='Поиск авторов'
        />
        <button type='submit' className={styles.apply}>
          Найти
        </button>
        <Link href='/admin/authors' className={styles.reset}>
          Сбросить
        </Link>
      </form>

      {authors.length === 0 ? (
        <p className={styles.empty}>Авторы не найдены.</p>
      ) : (
        <ul className={styles.list}>
          {authors.map((a) => (
            <li key={a.id} className={styles.item}>
              <Link href={`/admin/authors/${a.id}`} className={styles.itemLink}>
                <span className={styles.avatar}>
                  {a.photoUrl ? (
                    <Image src={a.photoUrl} alt='' fill sizes='44px' className={styles.avatarImg} unoptimized />
                  ) : (
                    <span className={styles.avatarPlaceholder} aria-hidden />
                  )}
                </span>
                <span className={styles.name}>{a.name}</span>
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
