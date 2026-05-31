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

// Used by the article detail page's "Другие рассказы автора" carousel.
// Returns same-author articles first (excluding the current one), then
// tops up with the most recent articles by any other author so the
// carousel always has at least `minCount` slides to loop through.
export async function getMoreArticlesForAuthor(
  authorId: number,
  excludeId: number,
  minCount = 3,
  cap = 12,
): Promise<ArticleSummary[]> {
  const supabase = await createClient()

  const { data: sameAuthor, error: sameError } = await supabase
    .from('Articles')
    .select(SELECT)
    .eq('author_id', authorId)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(cap)

  if (sameError) {
    throw new Error(`Не удалось загрузить статьи автора: ${sameError.message}`)
  }

  const sameRows = (sameAuthor ?? []) as unknown as ArticleRow[]
  const items: ArticleSummary[] = sameRows.map(normalizeArticleSummary)

  if (items.length >= minCount) return items.slice(0, cap)

  const needed = Math.max(minCount - items.length, cap - items.length)
  if (needed <= 0) return items

  const excludeIds = [excludeId, ...items.map((item) => item.id)]
  const { data: others, error: othersError } = await supabase
    .from('Articles')
    .select(SELECT)
    .neq('author_id', authorId)
    .not('id', 'in', `(${excludeIds.join(',')})`)
    .order('published_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(needed)

  if (othersError) {
    throw new Error(`Не удалось загрузить статьи других авторов: ${othersError.message}`)
  }

  const otherRows = (others ?? []) as unknown as ArticleRow[]
  items.push(...otherRows.map(normalizeArticleSummary))

  return items.slice(0, cap)
}
