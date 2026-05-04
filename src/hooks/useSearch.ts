'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchBooks, searchBooksQueryKey } from '@/api/books/searchBooks'

export type SearchPage = {
  books: import('@/entities/book/client').Book[]
  total: number
}

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3
const PAGE_SIZE = 12

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, isError } =
    useInfiniteQuery({
      queryKey: searchBooksQueryKey(debouncedQuery),
      queryFn: ({ pageParam }) => searchBooks(debouncedQuery, pageParam as number, PAGE_SIZE),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        const fetched = allPages.reduce((sum, p) => sum + p.books.length, 0)
        if (fetched >= lastPage.total) return undefined
        return lastPageParam + PAGE_SIZE
      },
      enabled,
    })

  const results = enabled ? (data?.pages.flatMap((p) => p.books) ?? []) : []
  const total = enabled ? (data?.pages[0]?.total ?? 0) : 0

  return {
    results,
    total,
    isLoading: enabled && isLoading,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage,
    fetchMore: fetchNextPage,
    isError,
  }
}