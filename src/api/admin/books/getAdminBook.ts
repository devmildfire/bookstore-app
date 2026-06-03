import { createAdminClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/storage'

export type EditionTable = 'Ebooks' | 'Audiobooks' | 'PrintedBooks' | 'CardBooks'

export const EDITION_LABEL: Record<EditionTable, string> = {
  Ebooks: 'Электронная книга',
  Audiobooks: 'Аудиокнига',
  PrintedBooks: 'Печатная книга',
  CardBooks: 'Карточная книга (Книга 2.0)',
}

// Which edition tables carry a sold_out column.
const HAS_SOLD_OUT: Record<EditionTable, boolean> = {
  Ebooks: false,
  Audiobooks: false,
  PrintedBooks: true,
  CardBooks: true,
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
}

export type AdminBook = {
  id: number
  name: string
  slug: string | null
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
    const { data: rows } = await admin
      .from(table)
      .select('id, price, discount, is_published, ' + (HAS_SOLD_OUT[table] ? 'sold_out' : 'id'))
      .eq('title_id', id)
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
      })
    }
  }

  return {
    id: title.id,
    name: title.name,
    slug: title.slug,
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
