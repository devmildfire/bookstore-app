import { cache } from 'react'
import { createDataClient } from '@/lib/supabase/server'
import { attachEditions } from './attachEditions'
import type { Book } from '@/entities/book/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { BookServerRow } from '@/entities/book/server'

export const bookQueryKey = (slug: string) => ['book', slug] as const

// Single source for the `get_catalog_book_by_slug` rows, memoized per request with
// React cache(). Both getBook (single normalized Book) and getBookEditions (all
// editions) derive from it, and the book page's generateMetadata + body both call
// getBook — so the RPC runs ONCE per slug per request instead of 2–3 times.
const getCatalogBookRows = cache(async (slug: string): Promise<BookServerRow[]> => {
  const supabase = createDataClient()

  const { data, error } = await supabase.rpc('get_catalog_book_by_slug', {
    title_slug: slug,
  })

  if (error) throw new Error(`Не удалось загрузить книгу: ${error.message}`)

  return (data ?? []) as BookServerRow[]
})

export async function getBook(slug: string): Promise<Book | null> {
  const rows = await getCatalogBookRows(slug)
  return rows.length > 0 ? normalizeBook(rows[0]) : null
}

export async function getBookEditions(slug: string): Promise<Book[]> {
  const rows = await getCatalogBookRows(slug)
  return rows.map(normalizeBook)
}

// All published, non-periodical-issue book slugs — used by the book page's
// generateStaticParams to prebuild detail pages at build time. Periodical issues are
// excluded (their slug redirects to the shared periodical anchor); the periodical
// parent + any new slugs still render on demand (dynamicParams defaults to true).
// Returns [] on error so a transient Supabase blip degrades to fully on-demand
// rendering instead of failing the build.
export async function getAllBookSlugs(): Promise<string[]> {
  try {
    const supabase = createDataClient()
    const { data, error } = await supabase
      .from('Titles')
      .select('slug')
      .eq('status', 'published')
      .is('periodical_id', null)

    if (error) throw error
    return (data ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s))
  } catch {
    return []
  }
}

// Editor-curated list from the TitleSimilarTitles join table, ordered by `position`.
// A title cannot include itself (enforced by a CHECK constraint on the table).
export async function getSimilarBooks(titleId: number): Promise<Book[]> {
  const supabase = createDataClient()

  const { data, error } = await supabase.rpc('get_similar_books', {
    p_title_id: titleId,
  })

  if (error) throw new Error(`Не удалось загрузить похожие книги: ${error.message}`)

  return attachEditions(((data ?? []) as BookServerRow[]).map(normalizeBook), supabase)
}
