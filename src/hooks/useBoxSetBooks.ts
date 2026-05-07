import { useQuery } from '@tanstack/react-query'
import { getBoxSetBooks } from '@/api/boxSets/getBoxSetBooks'

export function useBoxSetBooks(boxSetId: number | null) {
  return useQuery({
    queryKey: ['box-set-books', boxSetId],
    queryFn: () => getBoxSetBooks(boxSetId!),
    enabled: boxSetId !== null,
    staleTime: 5 * 60 * 1000,
  })
}
