import { createAdminClient } from '@/lib/supabase/server'
import { BOOK_PHOTOS_BUCKET } from '@/lib/storage'

export type AdminBookPhoto = {
  name: string
  url: string
}

// The gallery shown in the book-detail carousel is whatever lives in the
// `book-photos/{slug}/` folder (sorted by name). Returns the bare object names
// + cache-busted public URLs so the admin can manage them.
export async function getAdminBookPhotos(slug: string): Promise<AdminBookPhoto[]> {
  if (!slug) return []
  const admin = createAdminClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const { data, error } = await admin.storage
    .from(BOOK_PHOTOS_BUCKET)
    .list(slug, { sortBy: { column: 'name', order: 'asc' } })
  if (error || !data) return []

  return data
    .filter((f) => f.name && !f.name.startsWith('.'))
    .map((f) => {
      const v = encodeURIComponent(f.updated_at ?? f.created_at ?? '')
      return {
        name: f.name,
        url: `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${f.name}${v ? `?v=${v}` : ''}`,
      }
    })
}
