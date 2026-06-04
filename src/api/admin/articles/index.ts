import { createAdminClient } from '@/lib/supabase/server'
import { getArticleImageUrl } from '@/lib/storage'

export type AdminArticleListItem = {
  id: number
  title: string
  slug: string
  authorName: string | null
  coverUrl: string | null
  publishedAt: string
}

export type AdminArticle = {
  id: number
  title: string
  slug: string
  authorId: number
  excerpt: string | null
  coverPath: string | null
  coverUrl: string | null
  contentBlocks: unknown
  publishedAt: string
}

export async function getAdminArticles(): Promise<AdminArticleListItem[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('Articles')
    .select('id, title, slug, cover_path, published_at, Authors(name)')
    .order('published_at', { ascending: false })
  if (error) throw new Error(`Не удалось загрузить статьи: ${error.message}`)
  return (data ?? []).map((a) => {
    const author = a.Authors as { name: string } | null
    return {
      id: a.id,
      title: a.title,
      slug: a.slug,
      authorName: author?.name ?? null,
      coverUrl: getArticleImageUrl(a.cover_path),
      publishedAt: a.published_at,
    }
  })
}

export async function getAdminArticle(id: number): Promise<AdminArticle | null> {
  const admin = createAdminClient()
  const { data: a, error } = await admin.from('Articles').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить статью: ${error.message}`)
  if (!a) return null
  return {
    id: a.id,
    title: a.title,
    slug: a.slug,
    authorId: a.author_id,
    excerpt: a.excerpt,
    coverPath: a.cover_path,
    coverUrl: getArticleImageUrl(a.cover_path),
    contentBlocks: a.content_blocks,
    publishedAt: a.published_at,
  }
}

// All authors as id+name options for the article author picker.
export async function getAuthorOptions(): Promise<{ id: number; name: string }[]> {
  const admin = createAdminClient()
  const { data } = await admin.from('Authors').select('id, name').order('name', { ascending: true })
  return (data ?? []).map((a) => ({ id: a.id, name: a.name }))
}
