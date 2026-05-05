import type { ProductCategory } from '@/types/database'

export type BookSort = 'newest' | 'price-asc' | 'price-desc' | 'title'

export type BookFilters = {
  search: string
  category: ProductCategory | 'all'
  author: string
  priceFrom: number | null
  priceTo: number | null
  sort: BookSort
  page: number
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
}
