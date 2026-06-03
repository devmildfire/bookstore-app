import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'
import {
  EDITION_LABEL,
  ALL_EDITION_TABLES,
  EDITION_FILE_FOLDER,
  type EditionTable,
  type BookStatus,
  type AdminEdition,
} from '@/lib/admin/bookProducts'

export { EDITION_LABEL, ALL_EDITION_TABLES }
export type { EditionTable, BookStatus, AdminEdition }

function asBookStatus(raw: string | null | undefined): BookStatus {
  return raw === 'draft' || raw === 'archived' ? raw : 'published'
}

// Which edition tables carry a sold_out column.
const HAS_SOLD_OUT: Record<EditionTable, boolean> = {
  Ebooks: false,
  Audiobooks: false,
  PrintedBooks: true,
  CardBooks: true,
}

export type AdminBook = {
  id: number
  name: string
  slug: string | null
  status: BookStatus
  cover: string | null
  coverUrl: string | null
  description: string | null
  thesis: string | null
  ageRestriction: number | null
  firstRelease: string | null
  litForm: string | null
  isCompilation: boolean
  isFeatured: boolean
  authors: { id: number; name: string }[]
  editions: AdminEdition[]
}

const EDITION_TABLES: EditionTable[] = ['Ebooks', 'Audiobooks', 'PrintedBooks', 'CardBooks']

export async function getAdminBook(id: number): Promise<AdminBook | null> {
  const admin = createAdminClient()

  const { data: title, error } = await admin.from('Titles').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`Не удалось загрузить книгу: ${error.message}`)
  if (!title) return null

  // Authors via the link table.
  const { data: authorLinks } = await admin
    .from('Titles_Authors')
    .select('Authors(id, name)')
    .eq('title_id', id)
  const authors = (authorLinks ?? [])
    .map((l) => l.Authors)
    .filter((a): a is { id: number; name: string } => !!a)
    .map((a) => ({ id: a.id, name: a.name }))

  // Editions: one query per edition table.
  const editions: AdminEdition[] = []
  for (const table of EDITION_TABLES) {
    const hasFile = !!EDITION_FILE_FOLDER[table]
    const cols = ['id', 'price', 'discount', 'is_published']
    if (HAS_SOLD_OUT[table]) cols.push('sold_out')
    if (hasFile) cols.push('file_path')
    const { data: rows } = await admin.from(table).select(cols.join(', ')).eq('title_id', id)
    for (const row of (rows ?? []) as unknown as Array<Record<string, unknown>>) {
      editions.push({
        table,
        id: row.id as number,
        label: EDITION_LABEL[table],
        price: row.price == null ? null : Number(row.price),
        discount: row.discount == null ? null : Number(row.discount),
        isPublished: (row.is_published as boolean | null) ?? true,
        soldOut: HAS_SOLD_OUT[table] ? ((row.sold_out as boolean | null) ?? false) : null,
        hasSoldOut: HAS_SOLD_OUT[table],
        hasFile,
        filePath: hasFile ? ((row.file_path as string | null) ?? null) : null,
      })
    }
  }

  return {
    id: title.id,
    name: title.name,
    slug: title.slug,
    status: asBookStatus(title.status),
    cover: title.cover,
    coverUrl: getCoverUrl(title.cover),
    description: title.description,
    thesis: title.thesis,
    ageRestriction: title.age_restriction,
    firstRelease: title.first_release,
    litForm: title.lit_form,
    isCompilation: title.is_compilation,
    isFeatured: title.is_featured ?? false,
    authors,
    editions,
  }
}
