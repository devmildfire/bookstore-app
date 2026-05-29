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

const AVATARS_BUCKET = 'avatars'

/**
 * Returns the public Storage URL for a user's avatar.
 *
 * Mirror of getCoverUrl: builds the URL deterministically from
 * NEXT_PUBLIC_SUPABASE_URL so callers don't have to instantiate the
 * supabase-js browser client at render time (which crashes during SSR
 * because the browser client needs `window`). The path stored in
 * `Profiles.avatar_path` is a bare object key like `{user_id}/avatar.jpg`.
 */
export function getAvatarUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${AVATARS_BUCKET}/${path}`
}

const SUBSCRIPTIONS_BUCKET = 'subscriptions'

export function getSubscriptionImageUrl(filename: string | null): string | null {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  return `${supabaseUrl}/storage/v1/object/public/${SUBSCRIPTIONS_BUCKET}/${filename}`
}

const GIFT_CARDS_BUCKET = 'gift-cards'

export function getGiftCardImageUrl(filename: string | null): string | null {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  return `${supabaseUrl}/storage/v1/object/public/${GIFT_CARDS_BUCKET}/${filename}`
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

const AUTHORS_BUCKET = 'authors'

/**
 * Convert an author photo filename into a public Supabase Storage URL.
 * Mirrors the covers pattern: `Authors.photo` stores a bare filename
 * (e.g. `staroobryadtsev.jpg`) and we build the URL at runtime.
 */
export function getAuthorPhotoUrl(filename: string | null): string | null {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  return `${supabaseUrl}/storage/v1/object/public/${AUTHORS_BUCKET}/${filename}`
}

const BOOKTRAILERS_BUCKET = 'booktrailers'

/**
 * URLs for a book's promotional video. The video is served in two encodings
 * (MP4 for universal support, WebM/VP9 for browsers that prefer it) plus a
 * poster image shown before play. Files always live at:
 *   booktrailers/{slug}/video.mp4
 *   booktrailers/{slug}/video.webm
 *   booktrailers/{slug}/poster.jpg   (only when has_poster is true)
 */
export function getBooktrailerUrls(slug: string, hasPoster: boolean) {
  if (!supabaseUrl) return null
  const base = `${supabaseUrl}/storage/v1/object/public/${BOOKTRAILERS_BUCKET}/${slug}`
  return {
    mp4: `${base}/video.mp4`,
    webm: `${base}/video.webm`,
    poster: hasPoster ? `${base}/poster.jpg` : null,
  }
}

const VIDEOS_BUCKET = 'videos'
const PARTNERS_BUCKET = 'partners'
const WORKERS_BUCKET = 'workers'

/**
 * URL for an object in the public `videos` bucket. Paths are bare object keys
 * stored verbatim (e.g. `about/chtivo.mp4`).
 */
export function getVideoUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${VIDEOS_BUCKET}/${path}`
}

/**
 * Convert a worker photo filename into a public Storage URL.
 * `Workers.photo_path` stores bare filenames; the placeholder SVG is used
 * client-side when this returns null.
 */
export function getWorkerPhotoUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${WORKERS_BUCKET}/${path}`
}

/**
 * Convert a partner logo filename into a public Storage URL.
 * `Partners.logo_path` is allowed to be null; component handles fallback.
 */
export function getPartnerLogoUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${PARTNERS_BUCKET}/${path}`
}

export {
  COVERS_BUCKET,
  SUBSCRIPTIONS_BUCKET,
  GIFT_CARDS_BUCKET,
  BOX_SETS_PUBLIC_PATH,
  BOOK_PHOTOS_BUCKET,
  BOOKTRAILERS_BUCKET,
  AUTHORS_BUCKET,
  VIDEOS_BUCKET,
  PARTNERS_BUCKET,
  WORKERS_BUCKET,
}