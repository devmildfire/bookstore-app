'use server'

import { getBooks } from './getBooks'
import type { Book, BookFilters } from '@/entities/book/client'

// Server action for the client <BooksFeed> infinite query: fetch one catalog page of books
// (with editions) for the given filters + page. Reuses getBooks (anon, RLS-protected) and
// returns only the books — the first page + facets already came from the server render, and
// each page uses the same filters.limit so offsets line up with the server-rendered page 1.
export async function getBooksPageAction(filters: BookFilters, page: number): Promise<Book[]> {
  // This is a public 'use server' endpoint — clamp the client-supplied paging so a crafted
  // call can't request an enormous page/offset. (RLS + the catalog RPC still protect the data.)
  const limit = Math.min(Math.max(1, Math.trunc(filters.limit) || 12), 48)
  const safePage = Math.min(Math.max(1, Math.trunc(page) || 1), 1000)
  const { books } = await getBooks({ ...filters, limit, page: safePage })
  return books
}
