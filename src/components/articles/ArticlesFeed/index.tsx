'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import ArticleBatch from '@/components/articles/ArticleBatch'
import {
  getArticlesPageAction,
} from '@/api/articles/getArticlesPageAction'
import type { ArticleCursor, ArticlePage } from '@/api/articles/getArticlesPage'
import styles from './ArticlesFeed.module.scss'

type Props = {
  initialPage: ArticlePage
}

const articlesFeedQueryKey = ['articles', 'feed'] as const

// Articles are batched into separate (visually invisible) masonry
// containers — when the user crosses the midpoint of the latest batch
// the next batch is fetched and mounted as its own ArticleBatch.
export default function ArticlesFeed({ initialPage }: Props) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const query = useInfiniteQuery<ArticlePage, Error, { pages: ArticlePage[] }, typeof articlesFeedQueryKey, ArticleCursor>({
    queryKey: articlesFeedQueryKey,
    queryFn: ({ pageParam }) => getArticlesPageAction(pageParam),
    initialPageParam: null as ArticleCursor,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: { pages: [initialPage], pageParams: [null] },
    staleTime: 60 * 1000,
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = query

  // Re-attach observer when the latest batch (or its sentinel) changes.
  const attachObserver = useCallback(() => {
    const node = sentinelRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage()
          }
        }
      },
      { rootMargin: '300px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    // Re-run when the latest batch index changes so the observer
    // always tracks the most recently mounted batch's sentinel.
    return attachObserver()
  }, [attachObserver, data?.pages.length])

  const pages = data?.pages ?? []
  const isEmpty = pages.every((page) => page.items.length === 0)

  if (isEmpty) {
    return <p className={styles.empty}>Пока ничего нет</p>
  }

  return (
    <div className={styles.feed}>
      {pages.map((page, index) => {
        const isLatest = index === pages.length - 1
        return (
          <ArticleBatch
            key={index}
            articles={page.items}
            sentinelRef={isLatest ? sentinelRef : undefined}
          />
        )
      })}

      {isFetchingNextPage && (
        <div className={styles.loadingRow} aria-hidden>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      )}
    </div>
  )
}
