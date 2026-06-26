import { SUPABASE_PROXY_PREFIX } from '@/lib/supabase/sameOrigin'

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
 * `murlo.jpg`, `{user_id}/avatar.jpg`).
 *
 * Returns a SAME-ORIGIN RELATIVE path under `/sb` (the middleware proxies it to
 * Supabase — see src/proxy.ts). Relative → `next/image` treats it as a local
 * image (no `remotePatterns` needed) and NO env-specific host is baked into SSG
 * HTML, so one image works in every environment. For absolute URLs (email / OG /
 * social cards), use `absoluteStorageUrl()` below.
 */
function publicUrl(bucket: string, path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SUPABASE_PROXY_PREFIX}/storage/v1/object/public/${bucket}/${path}`
}

/**
 * Absolute form of a storage URL, for contexts that can't use a relative path:
 * transactional emails, Open Graph / social-card image metadata. `origin` is the
 * site origin (e.g. `NEXT_PUBLIC_BASE_URL` or the request origin) — the `/sb`
 * path on it is proxied to Supabase like any other.
 */
export function absoluteStorageUrl(origin: string, relativeUrl: string | null): string | null {
  if (!relativeUrl) return null
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) return relativeUrl
  return `${origin.replace(/\/$/, '')}${relativeUrl}`
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
  const base = `${SUPABASE_PROXY_PREFIX}/storage/v1/object/public/${BOOKTRAILERS_BUCKET}/${slug}`
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
