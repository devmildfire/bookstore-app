import type { Book } from './client'
import type { BookServerRow } from './server'

const DEFAULT_CATEGORY = 'Book2.0'

export function normalizeBook(raw: BookServerRow): Book {
  const authorNames = raw.Titles.Titles_Authors.map((item) => item.Authors?.name)
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, 'ru'))

  return {
    id: String(raw.id),
    titleId: raw.title_id,
    slug: raw.Titles.slug ?? String(raw.title_id),
    name: raw.Titles.name,
    description: raw.Titles.description,
    coverUrl: raw.Titles.cover,
    authorNames,
    authorName: authorNames.length > 0 ? authorNames.join(', ') : 'Автор не указан',
    price: raw.price ?? 0,
    category: DEFAULT_CATEGORY,
    inStock: raw.sold_out !== true,
    publishedAt: raw.publish_date ?? raw.release_date,
    litForm: raw.Titles.lit_form ?? null,
    ageRestriction: raw.Titles.age_restriction ?? null,
    year: raw.Titles.first_release?.slice(0, 4) ?? null,
  }
}
