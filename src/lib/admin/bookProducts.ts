// Client-safe constants and types for book products/status. Kept free of any
// server-only imports (no @/lib/supabase/server) so client components can use
// them without dragging next/headers into the browser bundle.

export type EditionTable = 'Ebooks' | 'Audiobooks' | 'PrintedBooks' | 'CardBooks'
export type BookStatus = 'draft' | 'published' | 'archived'

export type AdminAward = { id: number; title: string }

export const EDITION_LABEL: Record<EditionTable, string> = {
  Ebooks: 'Электронная книга',
  Audiobooks: 'Аудиокнига',
  PrintedBooks: 'Печатная книга',
  CardBooks: 'Карточная книга (Книга 2.0)',
}

// All product types, in display order — used to offer "add product".
export const ALL_EDITION_TABLES: EditionTable[] = ['Ebooks', 'Audiobooks', 'PrintedBooks', 'CardBooks']

// Edition tables that hold a downloadable digital file (in the private
// `digital-files` bucket). PrintedBook is physical — no file.
export const EDITION_FILE_FOLDER: Partial<Record<EditionTable, string>> = {
  Ebooks: 'ebooks',
  Audiobooks: 'audiobooks',
  CardBooks: 'cardbooks',
}

export type AdminEdition = {
  table: EditionTable
  id: number
  label: string
  price: number | null
  discount: number | null
  isPublished: boolean
  soldOut: boolean | null
  hasSoldOut: boolean
  // Digital file (download). null for PrintedBooks and for editions without an
  // uploaded file yet.
  hasFile: boolean
  filePath: string | null
}
