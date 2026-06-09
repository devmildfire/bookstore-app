import { createDataClient } from '@/lib/supabase/server'
import { BOOK_PHOTOS_BUCKET } from '@/lib/storage'
import { BOOK_PHOTO_SECTIONS } from '@/consts/bookPhotos'
import type { ProductCategory } from '@/types/database'

export type BookPhoto = {
  url: string
  blurDataURL: string | null
}

/** Photos grouped by the edition tab that shows their carousel. */
export type EditionPhotos = Partial<Record<ProductCategory, BookPhoto[]>>

/**
 * Lists a book's photos per edition subfolder (`book-photos/{slug}/{print,card,
 * digital}`) and groups them by the edition category whose tab renders the
 * carousel. Sections with no images are omitted. Blur placeholders come from
 * `Titles.book_photos_blurs`, keyed by `{folder}/{filename}`.
 */
export async function getEditionPhotos(slug: string): Promise<EditionPhotos> {
  const supabase = createDataClient()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

  const titleRes = await supabase
    .from('Titles')
    .select('book_photos_blurs')
    .eq('slug', slug)
    .maybeSingle()
  const blursRaw = titleRes.data?.book_photos_blurs
  const blurs: Record<string, string> = isStringMap(blursRaw) ? blursRaw : {}

  const sections = await Promise.all(
    BOOK_PHOTO_SECTIONS.map(async ({ folder, category }) => {
      const { data } = await supabase.storage
        .from(BOOK_PHOTOS_BUCKET)
        .list(`${slug}/${folder}`, { sortBy: { column: 'name', order: 'asc' } })

      const photos: BookPhoto[] = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith('.'))
        .map((f) => ({
          url: `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${folder}/${f.name}`,
          blurDataURL: blurs[`${folder}/${f.name}`] ?? null,
        }))

      return [category, photos] as const
    })
  )

  const out: EditionPhotos = {}
  for (const [category, photos] of sections) {
    if (photos.length > 0) out[category] = photos
  }
  return out
}

function isStringMap(value: unknown): value is Record<string, string> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((v) => typeof v === 'string')
}
