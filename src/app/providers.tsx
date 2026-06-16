'use client'

import { useEffect, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createAuthClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/contexts/toast'
import { CartProvider } from '@/contexts/cart'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
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

    const supabase = createAuthClient()

    supabase.auth.signInAnonymously().catch((error) => {
      anonymousSignInStarted.current = false
      console.error(error)
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
