import type { Metadata } from 'next'
import { getAdminBooks, type BookStatus } from '@/api/admin/books'
import StatusBadge, { type BadgeTone } from '@/components/admin/StatusBadge'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminPager from '@/components/admin/AdminPager'
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
      <AdminPageHeader
        title='Книги'
        count={`${total} всего`}
        createHref='/admin/books/new'
        createLabel='Создать книгу'
      />

      <AdminFilterBar
        resetHref='/admin/books'
        hasFilters={Boolean(sp.q || sp.status)}
        searchDefaultValue={sp.q ?? ''}
        searchPlaceholder='Поиск по названию'
      >
        <select name='status' defaultValue={sp.status ?? ''} aria-label='Статус'>
          <option value=''>Статус: все</option>
          <option value='published'>Опубликованные</option>
          <option value='draft'>Черновики</option>
          <option value='archived'>В архиве</option>
        </select>
      </AdminFilterBar>

      {books.length === 0 ? (
        <p className={styles.empty}>Книги не найдены.</p>
      ) : (
        <AdminList>
          {books.map((b) => (
            <AdminRow
              key={b.id}
              href={`/admin/books/${b.id}`}
              coverUrl={b.coverUrl}
              coverAlt={b.name}
              name={b.name}
              sub={`${b.authorName ? `${b.authorName} · ` : ''}${b.slug ? `/${b.slug}` : '—'}`}
              badges={
                <>
                  <StatusBadge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</StatusBadge>
                  {b.isFeatured && <StatusBadge tone='accent'>На главной</StatusBadge>}
                </>
              }
            />
          ))}
        </AdminList>
      )}

      <AdminPager page={page} totalPages={totalPages} hrefForPage={pageHref} />
    </section>
  )
}
