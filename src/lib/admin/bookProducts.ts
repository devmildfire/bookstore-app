// Client-safe constants and types for book products/status. Kept free of any
// server-only imports (no @/lib/supabase/server) so client components can use
// them without dragging next/headers into the browser bundle.

export type EditionTable = 'Ebooks' | 'Audiobooks' | 'PrintedBooks' | 'CardBooks'
export type BookStatus = 'draft' | 'published' | 'archived'

export const EDITION_LABEL: Record<EditionTable, string> = {
  Ebooks: 'Электронная книга',
  Audiobooks: 'Аудиокнига',
  PrintedBooks: 'Печатная книга',
  CardBooks: 'Карточная книга (Книга 2.0)',
}

// All product types, in display order — used to offer "add product".
export const ALL_EDITION_TABLES: EditionTable[] = ['Ebooks', 'Audiobooks', 'PrintedBooks', 'CardBooks']

export type AdminEdition = {
  table: EditionTable
  id: number
  label: string
  price: number | null
  discount: number | null
  isPublished: boolean
  soldOut: boolean | null
  hasSoldOut: boolean
}
