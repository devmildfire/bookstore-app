import type { ProductCategory } from '@/types/database'

export type BookSort = 'year-desc' | 'year-asc' | 'author-asc' | 'author-desc' | 'price-asc' | 'price-desc'

export type BookFilters = {
  search: string
  categories: ProductCategory[]
  authors: string[]
  years: string[]
  priceFrom: number | null
  priceTo: number | null
  sort: BookSort
  page: number
  limit: number
}

export type Book = {
  id: string
  titleId: number
  slug: string
  name: string
  description: string | null
  thesis: string | null
  coverUrl: string | null
  authorNames: string[]
  authorName: string
  price: number
  discount: number | null
  originalPrice: number | null
  category: ProductCategory
  inStock: boolean
  hasMultipleProducts: boolean
  publishedAt: string | null
  litForm: string | null
  ageRestriction: number | null
  year: string | null
}

export type BookCatalog = {
  books: Book[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  categories: ProductCategory[]
  authors: string[]
  years: string[]
}
