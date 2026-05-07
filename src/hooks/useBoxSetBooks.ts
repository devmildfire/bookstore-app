import { useQuery } from '@tanstack/react-query'
import { getBoxSetBooks, boxSetBooksQueryKey } from '@/api/boxSets/getBoxSetBooks'

export function useBoxSetBooks(boxSetId: number | null) {
  return useQuery({
    queryKey: boxSetBooksQueryKey(boxSetId ?? 0),
    // `enabled` guard below ensures boxSetId is always a number when this runs
    queryFn: () => getBoxSetBooks(boxSetId as number),
    enabled: boxSetId !== null,
    staleTime: 5 * 60 * 1000,
  })
}
