'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/contexts/toast'
import { CartProvider } from '@/contexts/cart'

// Dev-only. Dynamically imported + statically guarded by NODE_ENV so the devtools
// bundle is never shipped to production (the import() is dead-code-eliminated in prod).
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('@tanstack/react-query-devtools').then((m) => m.ReactQueryDevtools), {
        ssr: false,
      })
    : () => null

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        // Server-hydrated/cached queries shouldn't re-hit Supabase just because the tab
        // regained focus.
        refetchOnWindowFocus: false,
      },
    },
  })
}

// Singleton on the browser — avoids creating a new client on every render
let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

type Props = {
  children: React.ReactNode
}

// Whether a session (anon or real) already exists, per the proxy-set hint cookie.
// Read client-side so the root layout stays auth-free / PPR-friendly. With
// `tokens-only` encoding the real session cookies are HttpOnly (unreadable here),
// which is exactly why we rely on this boolean hint instead of getSession().
function hasExistingSession(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split('; ').includes('bookstore_has_session=1')
}

export default function Providers({ children }: Props) {
  const queryClient = getQueryClient()
  const anonymousSignInStarted = useRef(false)

  useEffect(() => {
    if (anonymousSignInStarted.current) return
    if (hasExistingSession()) return

    anonymousSignInStarted.current = true

    // Dynamic-import keeps @supabase/ssr out of the eager bundle; it loads as its own chunk
    // when the anon sign-in actually runs (post-hydration), not in the first-load critical path.
    import('@/lib/supabase/client').then(({ createAuthClient }) => {
      createAuthClient().auth.signInAnonymously().catch((error) => {
        anonymousSignInStarted.current = false
        console.error(error)
      })
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>

      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
