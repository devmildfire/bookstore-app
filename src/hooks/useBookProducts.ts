'use client'

import { useQuery } from '@tanstack/react-query'
import { getBookProducts, bookProductsQueryKey } from '@/api/books/getBookProducts'

export function useBookProducts(slug: string, enabled = true) {
  return useQuery({
    queryKey: bookProductsQueryKey(slug),
    queryFn: () => getBookProducts(slug),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
