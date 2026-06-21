import { getArticleBySlug } from '@/api/articles/getArticleBySlug'
import { getAuthor } from '@/api/authors'
import { getBook } from '@/api/books'
import { getPeriodical } from '@/api/periodicals'
import type { SocialCardKind } from './cardTypes'

export type SocialCardData = {
  kind: SocialCardKind
  kicker: string
  title: string
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  // periodical + article cards show the 3-leaf «Русский Динозавр» mark in the kicker
  kickerMark?: boolean
}

function truncateDescription(value: string | null | undefined): string | null {
  if (!value) return null
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (!normalized) return null
  return normalized.length > 150 ? `${normalized.slice(0, 147)}...` : normalized
}

function genericCard(kind: SocialCardKind): SocialCardData {
  const label = kind === 'home' ? 'Независимое издательство' : 'Чтиво'
  return {
    kind,
    kicker: label,
    title: 'Чтиво',
    subtitle: 'Книги, которые меняют взгляд на мир',
    description: 'Независимое издательство и книжный магазин.',
    imageUrl: null,
  }
}

export async function resolveSocialCard(
  kind: SocialCardKind,
  targetParts: readonly string[] = [],
): Promise<SocialCardData> {
  if (kind === 'home') {
    // The wordmark already says ЧТИВО, so the tagline goes in the title slot.
    return {
      kind,
      kicker: 'Независимое издательство',
      title: 'Книги, которые меняют взгляд на мир',
      subtitle: 'Независимое издательство и книжный магазин.',
      description: null,
      imageUrl: null,
    }
  }

  const target = targetParts[0]
  if (!target) return genericCard(kind)

  if (kind === 'book') {
    const [book, periodical] = await Promise.all([getBook(target), getPeriodical(target)])
    if (book) {
      return {
        kind,
        kicker: 'Книга',
        title: book.name,
        subtitle: book.authorName,
        description: truncateDescription(book.description ?? book.thesis),
        imageUrl: book.coverUrl,
      }
    }
    if (periodical) {
      return {
        kind,
        kicker: 'Литжурнал',
        title: periodical.name,
        subtitle: 'Чтиво',
        description: truncateDescription(periodical.description),
        imageUrl: periodical.issues[0]?.book.coverUrl ?? null,
        kickerMark: true,
      }
    }
    return genericCard(kind)
  }

  if (kind === 'author') {
    const id = Number(target)
    const author = Number.isInteger(id) && id > 0 ? await getAuthor(id) : null
    if (!author) return genericCard(kind)
    return {
      kind,
      kicker: 'Автор Чтиво',
      title: author.name,
      subtitle: author.city,
      description: truncateDescription(author.bio),
      imageUrl: author.photoUrl,
    }
  }

  const article = await getArticleBySlug(target)
  if (!article) return genericCard(kind)
  return {
    kind,
    kicker: 'Рассказ',
    title: article.title,
    subtitle: article.author.name,
    description: truncateDescription(article.excerpt),
    imageUrl: article.coverUrl,
    kickerMark: true,
  }
}
