const COVERS_BUCKET = 'covers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

/**
 * Convert a cover filename (or legacy full URL) into a public Supabase Storage URL.
 *
 * The `Titles.cover` column stores bare filenames (e.g., "murlo.jpg").
 * This function constructs the full URL using NEXT_PUBLIC_SUPABASE_URL,
 * so it works in any environment — local dev, self-hosted, or Supabase Cloud.
 *
 * For self-hosted Supabase on the same VPS behind a reverse proxy,
 * set NEXT_PUBLIC_SUPABASE_URL to the public-facing URL (e.g., https://api.example.com).
 */
export function getCoverUrl(filename: string | null): string | null {
  if (!filename) return null

  // Already a full URL (legacy data or external URL) — return as-is
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename

  // Bare filename — construct Storage URL
  return `${supabaseUrl}/storage/v1/object/public/${COVERS_BUCKET}/${filename}`
}

/**
 * Extract the bare filename from a URL or pass through a bare filename.
 * Used when writing cover values to the database.
 */
export function getCoverFilename(value: string | null): string | null {
  if (!value) return null
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const lastSegment = value.split('/').pop()
    return lastSegment ?? null
  }
  return value
}

const SUBSCRIPTIONS_BUCKET = 'subscriptions'

export function getSubscriptionImageUrl(filename: string | null): string | null {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  return `${supabaseUrl}/storage/v1/object/public/${SUBSCRIPTIONS_BUCKET}/${filename}`
}

const BOX_SETS_PUBLIC_PATH = '/boxsets'

export function getBoxSetImageUrl(filename: string | null): string | null {
  if (!filename) return null
  return `${BOX_SETS_PUBLIC_PATH}/${filename}`
}

const BOOK_PHOTOS_BUCKET = 'book-photos'

/**
 * Returns an ordered list of photo URLs for a book's photo series.
 * Photos are stored as book-photos/{slug}/{n}.jpg for n = 1..count.
 * Falls back to an empty array if coverUrl is null.
 */
export function getBookPhotoUrls(slug: string, count: number): string[] {
  if (!supabaseUrl || count === 0) return []
  return Array.from({ length: count }, (_, i) => {
    return `${supabaseUrl}/storage/v1/object/public/${BOOK_PHOTOS_BUCKET}/${slug}/${i + 1}.jpg`
  })
}

export { COVERS_BUCKET, SUBSCRIPTIONS_BUCKET, BOX_SETS_PUBLIC_PATH, BOOK_PHOTOS_BUCKET }