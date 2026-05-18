import { createDataClient } from '@/lib/supabase/server'
import { BOOK_PHOTOS_BUCKET } from '@/lib/storage'

export async function getBookPhotoUrls(slug: string): Promise<string[]> {
  const supabase = createDataClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const { data, error } = await supabase.storage
    .from(BOOK_PHOTOS_BUCKET)
    .list(slug, { sortBy: { column: 'name', order: 'asc' } })

  if (error || !data || data.length === 0) return []

  return data
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${f.name}`)
}
