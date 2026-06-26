import type { Metadata } from 'next'
import { getSiteOrigin } from '@/lib/siteUrl'

export const SOCIAL_CARD_KINDS = ['home', 'book', 'author', 'article'] as const
export type SocialCardKind = (typeof SOCIAL_CARD_KINDS)[number]

export type SocialCardVariant = 'og-wide' | 'og-square' | 'x-wide'

export type SocialCardVariantConfig = {
  id: SocialCardVariant
  width: number
  height: number
  label: string
}

export const SOCIAL_CARD_VARIANTS: Record<SocialCardVariant, SocialCardVariantConfig> = {
  'og-wide': { id: 'og-wide', width: 1200, height: 630, label: 'Open Graph wide' },
  'og-square': { id: 'og-square', width: 1200, height: 1200, label: 'Open Graph square' },
  'x-wide': { id: 'x-wide', width: 1200, height: 675, label: 'X wide' },
}

export const OPEN_GRAPH_VARIANTS: SocialCardVariant[] = ['og-wide', 'og-square']
export const TWITTER_VARIANTS: SocialCardVariant[] = ['x-wide']
export const PREVIEW_VARIANTS: SocialCardVariant[] = ['og-wide', 'og-square', 'x-wide']

export const SOCIAL_CARD_CACHE_CONTROL = 'public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400'

export type SocialCardTarget = string | null | undefined

export function isSocialCardKind(value: string): value is SocialCardKind {
  return SOCIAL_CARD_KINDS.includes(value as SocialCardKind)
}

export function isSocialCardVariant(value: string): value is SocialCardVariant {
  return value in SOCIAL_CARD_VARIANTS
}

export function getAbsoluteSiteUrl(path: string = '/'): string {
  return new URL(path, getSiteOrigin()).toString()
}

function normalizeTargetParts(target: SocialCardTarget): string[] {
  return target ? [target] : []
}

// Same-origin path — use for in-app previews (admin gallery) so they resolve on
// any host/port. The absolute variant below is only for og:/twitter: meta tags,
// where social crawlers require an absolute URL.
export function getSocialCardPath(
  kind: SocialCardKind,
  variant: SocialCardVariant,
  target?: SocialCardTarget,
): string {
  const parts = [kind, variant, ...normalizeTargetParts(target)].map(encodeURIComponent)
  return `/api/social-card/${parts.join('/')}`
}

export function getSocialCardUrl(
  kind: SocialCardKind,
  variant: SocialCardVariant,
  target?: SocialCardTarget,
): string {
  return getAbsoluteSiteUrl(getSocialCardPath(kind, variant, target))
}

export function getOpenGraphImages(
  kind: SocialCardKind,
  target: SocialCardTarget,
  alt: string,
): NonNullable<Metadata['openGraph']>['images'] {
  return OPEN_GRAPH_VARIANTS.map((variant) => {
    const config = SOCIAL_CARD_VARIANTS[variant]
    return {
      url: getSocialCardUrl(kind, variant, target),
      width: config.width,
      height: config.height,
      alt,
      type: 'image/png',
    }
  })
}

export function getTwitterImages(kind: SocialCardKind, target?: SocialCardTarget): string[] {
  return TWITTER_VARIANTS.map((variant) => getSocialCardUrl(kind, variant, target))
}

export function getSocialPreviewRows(kind: SocialCardKind, target?: SocialCardTarget) {
  return PREVIEW_VARIANTS.map((variant) => {
    const config = SOCIAL_CARD_VARIANTS[variant]
    return {
      ...config,
      url: getSocialCardPath(kind, variant, target),
    }
  })
}

// Builds the openGraph + twitter halves of a page's Metadata. Same shape for
// every page kind — pass the page-specific copy + target, get the social block.
export function socialMeta(input: {
  kind: SocialCardKind
  url: string
  title: string
  imageAlt: string
  target?: SocialCardTarget
  description?: string
  type?: 'website' | 'article' | 'profile'
}): Pick<Metadata, 'openGraph' | 'twitter'> {
  const { kind, url, title, imageAlt, target, description, type = 'website' } = input
  return {
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: 'Чтиво',
      locale: 'ru_RU',
      images: getOpenGraphImages(kind, target ?? null, imageAlt),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: getTwitterImages(kind, target),
    },
  }
}
