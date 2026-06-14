// Client-safe constants and types for book products/status. Kept free of any
// server-only imports (no @/lib/supabase/server) so client components can use
// them without dragging next/headers into the browser bundle.

// Editions live in one table keyed by `kind` (= the catalog category value).
export type EditionKind = 'EBook' | 'AudioBook' | 'PrintBook' | 'Book2.0'
export type BookStatus = 'draft' | 'published' | 'archived'

export type AdminAward = { id: number; title: string }

export const EDITION_LABEL: Record<EditionKind, string> = {
  EBook: 'Электронная книга',
  AudioBook: 'Аудиокнига',
  PrintBook: 'Печатная книга',
  'Book2.0': 'Карточная книга (Книга 2.0)',
}

// All edition kinds, in display order — used to offer "add product".
export const ALL_EDITION_KINDS: EditionKind[] = ['EBook', 'AudioBook', 'PrintBook', 'Book2.0']

// Kinds that hold a downloadable digital file (private `digital-files` bucket),
// mapped to their storage folder. PrintBook is physical — no file.
export const EDITION_FILE_FOLDER: Partial<Record<EditionKind, string>> = {
  EBook: 'ebooks',
  AudioBook: 'audiobooks',
  'Book2.0': 'cardbooks',
}

// Kinds that support a demo file (public sample in the `demos` bucket).
export const EDITION_HAS_DEMO: Partial<Record<EditionKind, boolean>> = {
  EBook: true,
  AudioBook: true,
  'Book2.0': true,
}

// Kinds whose editor exposes a sold_out toggle (physical stock).
export const EDITION_HAS_SOLD_OUT: Partial<Record<EditionKind, boolean>> = {
  PrintBook: true,
  'Book2.0': true,
}

export type AdminWorker = { linkId: number; workerId: number; name: string; job: string }

export type AdminEdition = {
  kind: EditionKind
  id: number
  label: string
  price: number | null
  discount: number | null
  isPublished: boolean
  soldOut: boolean | null
  hasSoldOut: boolean
  // Digital file (download). null for PrintBook and for editions without an
  // uploaded file yet.
  hasFile: boolean
  filePath: string | null
  // Demo file (public sample). Only EBook / AudioBook / Book2.0 have demos.
  hasDemo: boolean
  demoPath: string | null
  // Per-edition contributors (translator, narrator, illustrator, …).
  workers: AdminWorker[]
}
