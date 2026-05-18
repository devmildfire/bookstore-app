import type { ProductCategory } from '@/types/database'

export type BookSort = 'year-desc' | 'year-asc' | 'author-asc' | 'author-desc' | 'price-asc' | 'price-desc'

export type BookAward = {
  id: number
  title: string
  image: string | null
}

export type BookWorker = {
  name: string
  job: string
}

export type BookTrailer = {
  mp4Url: string
  webmUrl: string
  posterUrl: string | null
}

export type AuthorContactChannel = 'telegram' | 'instagram' | 'facebook' | 'twitter' | 'email'

export type AuthorContact = {
  channel: AuthorContactChannel
  url: string
}

export type Author = {
  id: number
  name: string
  photoUrl: string | null
  city: string | null
  birthDate: string | null
  deathDate: string | null
  phrase: string | null
  bio: string | null
  contacts: AuthorContact[]
}

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
  awards: BookAward[]
  // Edition-specific fields — populated only on the book detail RPC, all
  // optional and per-category. UI components select what to read by `category`.
  workers: BookWorker[]
  format: string | null              // PrintBook + Book 2.0
  paper: string | null               // PrintBook + Book 2.0
  pageCount: number | null           // PrintBook
  coverMaterial: string | null       // PrintBook
  binding: string | null             // PrintBook
  illustrations: string | null       // PrintBook
  printingTechnique: string | null   // Book 2.0
  packaging: string | null           // Book 2.0
  durationSeconds: number | null     // AudioBook
  fileSizeBytes: number | null       // AudioBook
  formats: string[] | null           // EBook
  characterCount: number | null      // EBook
  booktrailer: BookTrailer | null
  authors: Author[]
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
