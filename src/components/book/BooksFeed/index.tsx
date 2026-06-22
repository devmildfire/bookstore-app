'use client'

import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import BookCard from '@/components/book/BookCard'
import { getBooksPageAction } from '@/api/books/getBooksPageAction'
import type { Book, BookFilters } from '@/entities/book/client'
import gridStyles from '@/components/book/BookGrid/BookGrid.module.scss'
import btnStyles from '@/components/book/NewProducts/NewProducts.module.scss'

type Props = {
  // Server-rendered page-1 cards (BookCard renders server-side here, in NewProducts).
  children: React.ReactNode
  filters: BookFilters
  initialCount: number // number of books in the server-rendered page 1
  total: number
}

// Instant, anticipatory "load more": the first page is the server-rendered `children`; this
// client island fetches subsequent pages via getBooksPageAction and ALWAYS keeps one page
// fetched ahead of what's revealed. Clicking reveals the already-cached next page instantly
// (no navigation, no whole-page reload) and prefetches the one after it. Filter/sort changes
// remount this (keyed by filters in NewProducts), resetting the feed.
export default function BooksFeed({ children, filters, initialCount, total }: Props) {
  // How many client pages (page 2, 3, …) are currently shown. Fetched-but-unrevealed pages
  // sit in the query cache, so revealing one is instant.
  const [revealed, setRevealed] = useState(0)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
    Book[],
    Error,
    { pages: Book[][] },
    readonly ['booksFeed', BookFilters],
    number
  >({
    queryKey: ['booksFeed', filters] as const,
    queryFn: ({ pageParam }) => getBooksPageAction(filters, pageParam),
    initialPageParam: 2, // page 1 is the server-rendered children
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = initialCount + allPages.reduce((n, p) => n + p.length, 0)
      return loaded < total ? allPages.length + 2 : undefined
    },
    staleTime: 60 * 1000,
  })

  const pages = data?.pages ?? []

  // Keep exactly one page fetched ahead of what's revealed (anticipatory prefetch).
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && pages.length < revealed + 1) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, pages.length, revealed, fetchNextPage])

  const revealedBooks = pages.slice(0, revealed).flat()
  const shownCount = initialCount + revealedBooks.length
  const hasMore = shownCount < total
  // Only block if the user has outrun the prefetch (clicked faster than a page can load).
  const waiting = isFetchingNextPage && revealed >= pages.length

  return (
    <>
      <div className={gridStyles.grid}>
        {children}
        {revealedBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {hasMore && (
        <div className={btnStyles.buttonContainer}>
          <button
            type="button"
            className={btnStyles.button}
            onClick={() => setRevealed((r) => r + 1)}
            disabled={waiting}
          >
            {waiting ? 'Загрузка…' : 'Загрузить больше'}
          </button>
        </div>
      )}
    </>
  )
}
