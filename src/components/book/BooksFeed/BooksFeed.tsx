'use client'

import { useEffect, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import BookCard from '@/components/book/BookCard'
import { getBooksPageAction } from '@/api/books/getBooksPageAction'
import type { Book, BookFilters } from '@/entities/book/client'
import gridStyles from '@/components/book/BookGrid/BookGrid.module.scss'
import btnStyles from '@/components/book/NewProducts/NewProducts.module.scss'
import styles from './BooksFeed.module.scss'

type Props = {
  // Batch 1 — server-fetched, rendered visible.
  children: React.ReactNode
  // Batch 2 — server-fetched, rendered HIDDEN with eager covers so it preloads. Revealed
  // instantly on the first "load more" (CSS flip — no fetch, images already loaded).
  prefetched: React.ReactNode
  filters: BookFilters
  initialCount: number // books in batch 1 (the visible-at-start set)
  prefetchedCount: number // books in batch 2 (the hidden-ahead set)
  total: number
}

// Zero-perceived-latency "load more": there is ALWAYS one batch rendered-and-hidden ahead of
// what's revealed, with its covers already loading (eager). Clicking flips that batch visible
// instantly (CSS only) and kicks off fetching + hidden-preloading the NEXT batch — so by the
// time the user clicks again, it's ready too. Batches 1+2 are server-fetched (no client round
// trip); batches 3+ come from getBooksPageAction. Hidden batches use `display:none`; revealed
// ones `display:contents`, so the cards flow into the shared grid in document order.
export default function BooksFeed({ children, prefetched, filters, initialCount, prefetchedCount, total }: Props) {
  // How many batches BEYOND batch 1 are revealed. 0 = only batch 1 visible (batch 2 hidden-ahead).
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
    initialPageParam: 3, // batches 1+2 are server-rendered; client pages start at 3
    getNextPageParam: (_lastPage, allPages) => {
      const loaded = initialCount + prefetchedCount + allPages.reduce((n, p) => n + p.length, 0)
      return loaded < total ? allPages.length + 3 : undefined
    },
    staleTime: 60 * 1000,
  })

  const pages = data?.pages ?? []

  // Keep one CLIENT batch fetched ahead of what's revealed, so its covers preload while hidden.
  // revealed=0 → batch 2 (server) is the ready-ahead, no client fetch. revealed=k≥1 → the
  // hidden-ahead is client page[k-1], so we need pages.length ≥ k.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && pages.length < revealed) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, pages.length, revealed, fetchNextPage])

  // Books currently visible: batch 1 + (batch 2 if revealed) + revealed client batches.
  const clientShown = pages.slice(0, Math.max(0, revealed - 1)).reduce((n, p) => n + p.length, 0)
  const shownCount = initialCount + (revealed >= 1 ? prefetchedCount : 0) + clientShown
  const hasMore = shownCount < total
  // The batch the next click reveals is ready unless the user out-ran the client prefetch.
  const nextReady = revealed === 0 || pages.length >= revealed

  return (
    <>
      <div className={gridStyles.grid}>
        {children}

        {/* Batch 2 — hidden until the first reveal. */}
        <div className={revealed >= 1 ? styles.shown : styles.hidden}>{prefetched}</div>

        {/* Batches 3+ — each client page in its own reveal wrapper. The last fetched one
            (index === revealed - 1) stays hidden as the preloading ahead-batch. */}
        {pages.slice(0, revealed).map((page, i) => (
          <div key={i} className={i < revealed - 1 ? styles.shown : styles.hidden}>
            {page.map((book) => (
              <BookCard key={book.id} book={book} eager />
            ))}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className={btnStyles.buttonContainer}>
          <button
            type="button"
            className={btnStyles.button}
            onClick={() => setRevealed((r) => r + 1)}
            disabled={!nextReady}
          >
            {nextReady ? 'Загрузить больше' : 'Загрузка…'}
          </button>
        </div>
      )}
    </>
  )
}
