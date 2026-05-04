'use client'

import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { searchBooks, searchBooksQueryKey } from '@/api/books/searchBooks'

const DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 3

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const enabled = debouncedQuery.length >= MIN_QUERY_LENGTH

  const { data: results = [], isLoading, isError } = useQuery({
    queryKey: searchBooksQueryKey(debouncedQuery),
    queryFn: () => searchBooks(debouncedQuery),
    enabled,
  })

  return {
    results: enabled ? results : [],
    isLoading: enabled && isLoading,
    isError,
  }
}