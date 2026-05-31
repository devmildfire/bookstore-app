import { getArticleImageUrl, getAuthorPhotoUrl } from '@/lib/storage'
import type { Article, ArticleAuthor, ArticleSummary, ContentBlock } from './client'
import type { ArticleRow } from './server'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Defensive parser: silently drops malformed entries so a bad block in
// the JSONB column can't crash the entire article render.
export function normalizeContentBlocks(raw: unknown): ContentBlock[] {
  if (!Array.isArray(raw)) return []
  const blocks: ContentBlock[] = []
  for (const item of raw) {
    if (!isRecord(item)) continue
    if (item.kind === 'paragraph' && typeof item.text === 'string') {
      blocks.push({ kind: 'paragraph', text: item.text })
      continue
    }
    if (item.kind === 'image') {
      const path = typeof item.path === 'string' ? item.path : null
      const caption = typeof item.caption === 'string' ? item.caption : null
      blocks.push({
        kind: 'image',
        path,
        imageUrl: getArticleImageUrl(path),
        caption,
      })
    }
  }
  return blocks
}

function normalizeAuthor(raw: ArticleRow['Authors']): ArticleAuthor {
  if (!raw) {
    return {
      id: 0,
      name: 'Автор',
      photoUrl: null,
      photoBlurDataUrl: null,
      bio: null,
      birthDate: null,
      city: null,
    }
  }
  return {
    id: raw.id,
    name: raw.name,
    photoUrl: getAuthorPhotoUrl(raw.photo),
    photoBlurDataUrl: raw.photo_blur,
    bio: raw.bio,
    birthDate: raw.birth_date,
    city: raw.city,
  }
}

export function normalizeArticle(raw: ArticleRow): Article {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    coverUrl: getArticleImageUrl(raw.cover_path),
    coverBlurDataUrl: raw.cover_blur,
    coverWidth: raw.cover_width,
    coverHeight: raw.cover_height,
    excerpt: raw.excerpt,
    publishedAt: raw.published_at,
    author: normalizeAuthor(raw.Authors),
    contentBlocks: normalizeContentBlocks(raw.content_blocks),
  }
}

export function normalizeArticleSummary(raw: ArticleRow): ArticleSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    coverUrl: getArticleImageUrl(raw.cover_path),
    coverBlurDataUrl: raw.cover_blur,
    coverWidth: raw.cover_width,
    coverHeight: raw.cover_height,
    excerpt: raw.excerpt,
    publishedAt: raw.published_at,
    author: {
      id: raw.Authors?.id ?? 0,
      name: raw.Authors?.name ?? 'Автор',
    },
  }
}
