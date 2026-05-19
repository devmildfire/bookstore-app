import { createDataClient } from '@/lib/supabase/server'
import { BOOK_PHOTOS_BUCKET } from '@/lib/storage'

export type BookPhoto = {
  url: string
  blurDataURL: string | null
}

export async function getBookPhotoUrls(slug: string): Promise<BookPhoto[]> {
  const supabase = createDataClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const [listRes, titleRes] = await Promise.all([
    supabase.storage
      .from(BOOK_PHOTOS_BUCKET)
      .list(slug, { sortBy: { column: 'name', order: 'asc' } }),
    supabase.from('Titles').select('book_photos_blurs').eq('slug', slug).maybeSingle(),
  ])

  if (listRes.error || !listRes.data || listRes.data.length === 0) return []

  const blursRaw = titleRes.data?.book_photos_blurs
  const blurs: Record<string, string> = isStringMap(blursRaw) ? blursRaw : {}

  return listRes.data
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => ({
      url: `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${f.name}`,
      blurDataURL: blurs[f.name] ?? null,
    }))
}

function isStringMap(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((v) => typeof v === 'string')
}
