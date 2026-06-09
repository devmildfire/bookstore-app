import type { ProductCategory } from '@/types/database'

/**
 * Book photos live in per-edition subfolders: `book-photos/{slug}/{folder}`.
 * Each section's carousel renders inside its matching edition tab on the book
 * detail page (and is a separate upload section in the admin book editor).
 * Any section may be empty. Order mirrors the edition tab order.
 *
 *   print   → PrintBook  (ПЕЧАТНОЕ ИЗДАНИЕ) — photos of the printed book
 *   card    → Book2.0     (КНИГА 2.0)        — photos of the card-book cards
 *   digital → EBook       (ЦИФРОВОЕ ИЗДАНИЕ) — renders / artist representations
 */
export type BookPhotoFolder = 'print' | 'card' | 'digital'

export type BookPhotoSection = {
  folder: BookPhotoFolder
  category: ProductCategory
  label: string
}

export const BOOK_PHOTO_SECTIONS: readonly BookPhotoSection[] = [
  { folder: 'print', category: 'PrintBook', label: 'Печатное издание' },
  { folder: 'card', category: 'Book2.0', label: 'Книга 2.0' },
  { folder: 'digital', category: 'EBook', label: 'Цифровое издание' },
] as const

export const BOOK_PHOTO_FOLDERS: readonly BookPhotoFolder[] = BOOK_PHOTO_SECTIONS.map(
  (s) => s.folder
)

export function isBookPhotoFolder(value: unknown): value is BookPhotoFolder {
  return typeof value === 'string' && BOOK_PHOTO_FOLDERS.includes(value as BookPhotoFolder)
}
