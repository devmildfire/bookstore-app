import { createClient } from '@/lib/supabase/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'

export const searchBooksQueryKey = (query: string) => ['search', 'books', query] as const

type SearchBooksResult = {
  books: Book[]
  total: number
}

type RpcRow = {
  id: number
  price: number
  sold_out: boolean
  is_published: boolean
  publish_date: string | null
  release_date: string | null
  title_id: number
  title_name: string
  title_slug: string | null
  title_cover: string | null
  title_description: string | null
  title_lit_form: string | null
  title_age_restriction: number | null
  title_first_release: string | null
  author_names: string[]
  total_count: number
}

export async function searchBooks(
  query: string,
  offset: number = 0,
  limit: number = 12,
): Promise<SearchBooksResult> {
  if (query.length < 3) return { books: [], total: 0 }

  const supabase = createClient()
  const { data, error } = await (supabase.rpc as any)('search_books', {
    search_term: query,
    result_limit: limit,
    result_offset: offset,
  })

  if (error) {
    throw new Error(`Не удалось выполнить поиск: ${error.message}`)
  }

  const rows = (data ?? []) as unknown as RpcRow[]
  if (rows.length === 0) return { books: [], total: 0 }

  const total = rows[0].total_count
  const books = rows.map((row) =>
    normalizeBook({
      id: row.id,
      price: row.price,
      sold_out: row.sold_out,
      is_published: row.is_published,
      publish_date: row.publish_date,
      release_date: row.release_date,
      title_id: row.title_id,
      Titles: {
        id: row.title_id,
        slug: row.title_slug,
        name: row.title_name,
        cover: row.title_cover,
        description: row.title_description,
        lit_form: row.title_lit_form,
        age_restriction: row.title_age_restriction,
        first_release: row.title_first_release,
        Titles_Authors: (row.author_names ?? []).map((name: string) => ({
          Authors: { id: 0, name },
        })),
      },
    }),
  )

  return { books, total }
}