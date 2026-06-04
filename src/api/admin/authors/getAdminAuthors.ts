import { createAdminClient } from '@/lib/supabase/server'
import { getAuthorPhotoUrl } from '@/lib/storage'

export type AdminAuthorListItem = {
  id: number
  name: string
  photoUrl: string | null
}

export type AdminAuthorsResult = {
  authors: AdminAuthorListItem[]
  total: number
  page: number
  pageSize: number
}

export const ADMIN_AUTHORS_PAGE_SIZE = 30

export async function getAdminAuthors(filters: { q?: string; page?: number } = {}): Promise<AdminAuthorsResult> {
  const admin = createAdminClient()
  const page = Math.max(1, filters.page ?? 1)
  const pageSize = ADMIN_AUTHORS_PAGE_SIZE
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = admin.from('Authors').select('id, name, photo', { count: 'exact' }).order('id', { ascending: false })
  const q = filters.q?.trim()
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error, count } = await query.range(from, to)
  if (error) throw new Error(`Не удалось загрузить авторов: ${error.message}`)

  const authors = (data ?? []).map((a) => ({ id: a.id, name: a.name, photoUrl: getAuthorPhotoUrl(a.photo) }))
  return { authors, total: count ?? 0, page, pageSize }
}
