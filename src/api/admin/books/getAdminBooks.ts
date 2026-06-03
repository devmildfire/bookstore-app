import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'

export type AdminBookListItem = {
  id: number
  name: string
  slug: string | null
  coverUrl: string | null
  isFeatured: boolean
}

export type AdminBooksResult = {
  books: AdminBookListItem[]
  total: number
  page: number
  pageSize: number
}

export const ADMIN_BOOKS_PAGE_SIZE = 30

// All titles, newest first, with name search + pagination. Service-role read.
export async function getAdminBooks(filters: { q?: string; page?: number } = {}): Promise<AdminBooksResult> {
  const admin = createAdminClient()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = ADMIN_BOOKS_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin
    .from('Titles')
    .select('id, name, slug, cover, is_featured', { count: 'exact' })
    .order('id', { ascending: false })

  const q = filters.q?.trim()
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error, count } = await query.range(from, to)
  if (error) throw new Error(`Не удалось загрузить книги: ${error.message}`)

  const books: AdminBookListItem[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    coverUrl: getCoverUrl(row.cover),
    isFeatured: row.is_featured ?? false,
  }))
  return { books, total: count ?? 0, page, pageSize }
}
