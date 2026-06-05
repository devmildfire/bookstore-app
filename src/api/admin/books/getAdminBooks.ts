import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'
import type { BookStatus } from './getAdminBook'

export type AdminBookListItem = {
  id: number
  name: string
  slug: string | null
  status: BookStatus
  coverUrl: string | null
  isFeatured: boolean
  authorName: string | null
}

export type AdminBooksResult = {
  books: AdminBookListItem[]
  total: number
  page: number
  pageSize: number
}

export const ADMIN_BOOKS_PAGE_SIZE = 30

// All titles, newest first, with name search + pagination. Service-role read.
export async function getAdminBooks(
  filters: { q?: string; status?: string; page?: number } = {}
): Promise<AdminBooksResult> {
  const admin = createAdminClient()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = ADMIN_BOOKS_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('Titles')
    .select('id, name, slug, status, cover', { count: 'exact' })
    .order('id', { ascending: false })

  const q = filters.q?.trim()
  if (q) query = query.ilike('name', `%${q}%`)
  if (filters.status === 'draft' || filters.status === 'published' || filters.status === 'archived') {
    query = query.eq('status', filters.status)
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw new Error(`Не удалось загрузить книги: ${error.message}`)

  // "На главной" reflects membership in featured_books (the homepage source);
  // the author name (first listed) comes from Titles_Authors.
  const pageTitleIds = (data ?? []).map((r) => r.id)
  const featuredIds = new Set<number>()
  const authorByTitle = new Map<number, string>()
  if (pageTitleIds.length > 0) {
    const [{ data: feat }, { data: links }] = await Promise.all([
      admin.from('featured_books').select('title_id').in('title_id', pageTitleIds),
      admin
        .from('Titles_Authors')
        .select('title_id, id, Authors(name)')
        .in('title_id', pageTitleIds)
        .order('id', { ascending: true }),
    ])
    for (const f of feat ?? []) featuredIds.add(f.title_id as number)
    for (const l of links ?? []) {
      const tid = l.title_id as number
      const name = (l.Authors as { name: string } | null)?.name
      if (name && !authorByTitle.has(tid)) authorByTitle.set(tid, name)
    }
  }

  const books: AdminBookListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: (row.status as BookStatus) ?? 'published',
    coverUrl: getCoverUrl(row.cover),
    isFeatured: featuredIds.has(row.id),
    authorName: authorByTitle.get(row.id) ?? null,
  }))
  return { books, total: count ?? 0, page, pageSize }
}
