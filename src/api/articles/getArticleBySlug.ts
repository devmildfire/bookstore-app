import { createClient } from '@/lib/supabase/server'
import { normalizeArticle } from '@/entities/article/normalize'
import type { Article } from '@/entities/article/client'
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

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('Articles')
    .select(SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`Не удалось загрузить статью: ${error.message}`)
  if (!data) return null

  return normalizeArticle(data as unknown as ArticleRow)
}
