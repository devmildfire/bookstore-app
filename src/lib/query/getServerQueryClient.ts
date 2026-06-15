import { QueryClient } from '@tanstack/react-query'

// Fresh QueryClient per server request, used to prefetch queries and dehydrate
// them into a <HydrationBoundary> so client useQuery hydrates with no initial
// fetch. Mirrors the client defaults in app/providers.tsx (staleTime 60s) so a
// hydrated entry isn't treated as instantly stale and refetched on mount.
export function getServerQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  })
}
