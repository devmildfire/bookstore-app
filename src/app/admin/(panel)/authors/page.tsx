import type { Metadata } from 'next'
import { getAdminAuthors } from '@/api/admin/authors'
import { AdminList, AdminRow } from '@/components/admin/AdminList'
import AdminFilterBar from '@/components/admin/AdminFilterBar'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminPager from '@/components/admin/AdminPager'
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
      <AdminPageHeader
        title='Авторы'
        count={`${total} всего`}
        createHref='/admin/authors/new'
        createLabel='Создать автора'
      />

      <AdminFilterBar
        resetHref='/admin/authors'
        hasFilters={Boolean(sp.q)}
        searchDefaultValue={sp.q ?? ''}
        searchPlaceholder='Поиск по имени'
      />

      {authors.length === 0 ? (
        <p className={styles.empty}>Авторы не найдены.</p>
      ) : (
        <AdminList>
          {authors.map((a) => (
            <AdminRow key={a.id} href={`/admin/authors/${a.id}`} coverUrl={a.photoUrl} coverAlt={a.name} name={a.name} />
          ))}
        </AdminList>
      )}

      <AdminPager page={page} totalPages={totalPages} hrefForPage={pageHref} />
    </section>
  )
}
