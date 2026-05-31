import { createClient } from '@/lib/supabase/server'
import { normalizeArticleSummary } from '@/entities/article/normalize'
import type { ArticleSummary } from '@/entities/article/client'
import type { ArticleRow } from '@/entities/article/server'

const SELECT = `
  id,
  slug,
  title,
  cover_path,
  cover_blur,
  cover_width,
  cover_height,
  excerpt,
  published_at,
  content_blocks,
  created_at,
  author_id,
  Authors:Authors!Articles_author_id_fkey ( * )
`

export type ArticleCursor = {
  publishedAt: string
  id: number
} | null

export type ArticlePage = {
  items: ArticleSummary[]
  nextCursor: ArticleCursor
}

const DEFAULT_PAGE_SIZE = 12

// Keyset-paginated, newest first. Each page reads pageSize+1 rows so we
// know whether a next cursor exists without a second query.
export async function getArticlesPage(
  cursor: ArticleCursor,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<ArticlePage> {
  const supabase = await createClient()
  let query = supabase
    .from('Articles')
    .select(SELECT)
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(pageSize + 1)

  if (cursor) {
    // (published_at, id) < (cursor.publishedAt, cursor.id), expressed as
    // PostgREST-friendly OR. Tuple comparison isn't exposed so we widen.
    query = query.or(
      `published_at.lt.${cursor.publishedAt},and(published_at.eq.${cursor.publishedAt},id.lt.${cursor.id})`,
    )
  }

  const { data, error } = await query
  if (error) throw new Error(`Не удалось загрузить статьи: ${error.message}`)

  const rows = (data ?? []) as unknown as ArticleRow[]
  const hasNext = rows.length > pageSize
  const items = rows.slice(0, pageSize).map(normalizeArticleSummary)

  const last = items[items.length - 1]
  const nextCursor: ArticleCursor =
    hasNext && last ? { publishedAt: last.publishedAt, id: last.id } : null

  return { items, nextCursor }
}
