import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'

export type FeaturedTitle = {
  id: number // featured_books row id
  titleId: number
  name: string
  coverUrl: string | null
}

// The homepage featured set, in display order (featured_books.sort_order).
export async function getFeaturedTitles(): Promise<FeaturedTitle[]> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('featured_books')
    .select('id, title_id, sort_order, Titles(name, cover)')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Не удалось загрузить рекомендованные: ${error.message}`)
  return (data ?? []).map((r) => {
    const title = r.Titles as { name: string; cover: string | null } | null
    return {
      id: r.id as number,
      titleId: r.title_id as number,
      name: title?.name ?? `#${r.title_id}`,
      coverUrl: getCoverUrl(title?.cover ?? null),
    }
  })
}
