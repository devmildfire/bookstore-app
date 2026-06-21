import type { BookFilters, BookSort } from '@/entities/book/client'
import type { ProductCategory } from '@/types/database'

export type CatalogFilterDraft = {
  categories: ProductCategory[]
  authors: string[]
  years: string[]
}

export type FilterGroup = 'categories' | 'authors' | 'years'
export type PanelId = 'authors' | 'categories' | 'years'

export const categoryLabels: Partial<Record<ProductCategory, string>> = {
  PrintBook: 'Печатное',
  EBook: 'Цифровое',
  AudioBook: 'Аудио',
  'Book2.0': 'Книга 2.0',
}

export const sortRows: Array<{ label: string; asc: BookSort; desc: BookSort }> = [
  { label: 'По дате издания', asc: 'year-asc', desc: 'year-desc' },
  { label: 'По фамилии автора', asc: 'author-asc', desc: 'author-desc' },
  { label: 'По цене', asc: 'price-asc', desc: 'price-desc' },
]

export function getDraftFromFilters(filters: BookFilters): CatalogFilterDraft {
  return {
    categories: filters.categories,
    authors: filters.authors,
    years: filters.years,
  }
}

export function getCategoryLabel(category: ProductCategory): string {
  return categoryLabels[category] ?? category
}
