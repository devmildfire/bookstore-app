import type { ProductCategory } from '@/types/database'
import type { Book } from './client'
import type { BookServerRow } from './server'
import { getCoverUrl } from '@/lib/storage'

export function normalizeBook(raw: BookServerRow): Book {
  const authorNames = (raw.author_names ?? [])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'ru'))

  return {
    id: `${raw.product_type ?? 'Book2.0'}-${raw.id}`,
    titleId: raw.title_id,
    slug: raw.title_slug ?? String(raw.title_id),
    name: raw.title_name,
    description: raw.title_description,
    thesis: raw.title_thesis ?? null,
    coverUrl: getCoverUrl(raw.title_cover),
    authorNames,
    authorName: authorNames.length > 0 ? authorNames.join(', ') : 'Автор не указан',
    price: raw.price ?? 0,
    category: (raw.product_type ?? 'Book2.0') as ProductCategory,
    inStock: raw.sold_out !== true,
    publishedAt: raw.publish_date ?? raw.release_date,
    litForm: raw.title_lit_form ?? null,
    ageRestriction: raw.title_age_restriction ?? null,
    year: raw.title_first_release?.slice(0, 4) ?? null,
  }
}
