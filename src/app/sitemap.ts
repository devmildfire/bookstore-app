import type { MetadataRoute } from 'next'
import { createDataClient } from '@/lib/supabase/server'
import { getAllBookSlugs } from '@/api/books/getBook'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

// Refresh hourly (ISR) so catalog/content changes made via the admin panel surface
// without a redeploy.
export const revalidate = 3600

// Public, indexable static routes.
const STATIC_PATHS = [
  '',
  '/about',
  '/contacts',
  '/gift-cards',
  '/subscription',
  '/dino-magazine',
  '/abzac',
  '/investors',
  '/newsletter',
]

type Client = ReturnType<typeof createDataClient>

// Each source is independently guarded so one failing query doesn't blank the whole
// sitemap (book slugs already degrade to [] internally).
async function authorIds(supabase: Client): Promise<number[]> {
  try {
    const { data } = await supabase.from('Authors').select('id')
    return (data ?? []).map((r) => r.id)
  } catch {
    return []
  }
}

async function articleSlugs(supabase: Client): Promise<string[]> {
  try {
    const { data } = await supabase.from('Articles').select('slug').not('published_at', 'is', null)
    return (data ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createDataClient()

  const [bookSlugs, authors, articles] = await Promise.all([
    getAllBookSlugs(),
    authorIds(supabase),
    articleSlugs(supabase),
  ])

  return [
    ...STATIC_PATHS.map((p) => ({ url: `${BASE_URL}${p || '/'}` })),
    ...bookSlugs.map((slug) => ({ url: `${BASE_URL}/books/${slug}` })),
    ...authors.map((id) => ({ url: `${BASE_URL}/authors/${id}` })),
    ...articles.map((slug) => ({ url: `${BASE_URL}/dino-magazine/${slug}` })),
  ]
}
