const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''

const COVERS_BUCKET = 'covers'
const AVATARS_BUCKET = 'avatars'
const SUBSCRIPTIONS_BUCKET = 'subscriptions'
const GIFT_CARDS_BUCKET = 'gift-cards'
const ARTICLES_BUCKET = 'articles'
const BOX_SETS_BUCKET = 'box-sets'
const BOOK_PHOTOS_BUCKET = 'book-photos'
const AUTHORS_BUCKET = 'authors'
const AWARDS_BUCKET = 'awards'
const BOOKTRAILERS_BUCKET = 'booktrailers'
const VIDEOS_BUCKET = 'videos'
const PARTNERS_BUCKET = 'partners'
const WORKERS_BUCKET = 'workers'
const DEMOS_BUCKET = 'demos'

/**
 * Build a public Supabase Storage URL from a bare object key (or pass through a
 * value that is already a full URL). Most columns store bare keys (e.g.
 * `murlo.jpg`, `{user_id}/avatar.jpg`); we build the URL from
 * NEXT_PUBLIC_SUPABASE_URL at runtime so callers don't instantiate the
 * supabase-js browser client at render time (it needs `window` and crashes
 * during SSR). Set NEXT_PUBLIC_SUPABASE_URL to the public-facing URL when
 * self-hosting behind a reverse proxy.
 */
function publicUrl(bucket: string, path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export const getCoverUrl = (filename: string | null) => publicUrl(COVERS_BUCKET, filename)
export const getAvatarUrl = (path: string | null) => publicUrl(AVATARS_BUCKET, path)
export const getSubscriptionImageUrl = (filename: string | null) => publicUrl(SUBSCRIPTIONS_BUCKET, filename)
export const getGiftCardImageUrl = (filename: string | null) => publicUrl(GIFT_CARDS_BUCKET, filename)
export const getArticleImageUrl = (filename: string | null) => publicUrl(ARTICLES_BUCKET, filename)
export const getBoxSetImageUrl = (filename: string | null) => publicUrl(BOX_SETS_BUCKET, filename)
export const getAuthorPhotoUrl = (filename: string | null) => publicUrl(AUTHORS_BUCKET, filename)
export const getVideoUrl = (path: string | null) => publicUrl(VIDEOS_BUCKET, path)
export const getWorkerPhotoUrl = (path: string | null) => publicUrl(WORKERS_BUCKET, path)
export const getPartnerLogoUrl = (path: string | null) => publicUrl(PARTNERS_BUCKET, path)
export const getDemoUrl = (path: string | null) => publicUrl(DEMOS_BUCKET, path)

/**
 * Award badges additionally allow legacy `/awards/...` public paths, returned
 * untouched. `Awards.image` otherwise stores a bare filename.
 */
export const getAwardUrl = (image: string | null) =>
  image?.startsWith('/') ? image : publicUrl(AWARDS_BUCKET, image)

/**
 * URLs for a book's promotional video. Served in two encodings (MP4 for
 * universal support, WebM/VP9 where preferred) plus a poster image shown before
 * play. Files always live at:
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

export {
  COVERS_BUCKET,
  SUBSCRIPTIONS_BUCKET,
  GIFT_CARDS_BUCKET,
  ARTICLES_BUCKET,
  BOX_SETS_BUCKET,
  BOOK_PHOTOS_BUCKET,
  BOOKTRAILERS_BUCKET,
  AUTHORS_BUCKET,
  AWARDS_BUCKET,
  VIDEOS_BUCKET,
  PARTNERS_BUCKET,
  WORKERS_BUCKET,
  DEMOS_BUCKET,
}
