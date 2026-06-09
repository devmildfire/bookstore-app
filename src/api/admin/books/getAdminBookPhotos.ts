import { createAdminClient } from '@/lib/supabase/server'
import { BOOK_PHOTOS_BUCKET } from '@/lib/storage'
import { BOOK_PHOTO_FOLDERS, type BookPhotoFolder } from '@/consts/bookPhotos'

export type AdminBookPhoto = {
  name: string
  url: string
}

/** Photos grouped by edition subfolder, for the admin book editor. */
export type AdminEditionPhotos = Record<BookPhotoFolder, AdminBookPhoto[]>

function emptyPhotos(): AdminEditionPhotos {
  return { print: [], card: [], digital: [] }
}

// Lists `book-photos/{slug}/{print,card,digital}` and returns each section's
// bare object names + cache-busted public URLs so the admin can manage them.
export async function getAdminBookPhotos(slug: string): Promise<AdminEditionPhotos> {
  const out = emptyPhotos()
  if (!slug) return out

  const admin = createAdminClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  await Promise.all(
    BOOK_PHOTO_FOLDERS.map(async (folder) => {
      const { data, error } = await admin.storage
        .from(BOOK_PHOTOS_BUCKET)
        .list(`${slug}/${folder}`, { sortBy: { column: 'name', order: 'asc' } })
      if (error || !data) return

      out[folder] = data
        .filter((f) => f.name && !f.name.startsWith('.'))
        .map((f) => {
          const v = encodeURIComponent(f.updated_at ?? f.created_at ?? '')
          return {
            name: f.name,
            url: `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${folder}/${f.name}${v ? `?v=${v}` : ''}`,
          }
        })
    })
  )

  return out
}
