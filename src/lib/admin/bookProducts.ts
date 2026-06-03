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

// Per-edition contributor join tables + their FK column to the edition row.
export const EDITION_WORKERS_TABLE: Record<EditionTable, string> = {
  Ebooks: 'EbookWorkers',
  Audiobooks: 'AudiobookWorkers',
  PrintedBooks: 'PrintedBookWorkers',
  CardBooks: 'CardBookWorkers',
}
export const EDITION_WORKERS_FK: Record<EditionTable, string> = {
  Ebooks: 'ebook_id',
  Audiobooks: 'audiobook_id',
  PrintedBooks: 'printed_book_id',
  CardBooks: 'card_book_id',
}

export type AdminWorker = { linkId: number; workerId: number; name: string; job: string }

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
  // Per-edition contributors (translator, narrator, illustrator, …).
  workers: AdminWorker[]
}
