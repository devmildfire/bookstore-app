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
  hasSession: boolean
}

export default function Providers({ children, hasSession }: Props) {
  const queryClient = getQueryClient()
  const anonymousSignInStarted = useRef(false)

  useEffect(() => {
    if (hasSession) return
    if (anonymousSignInStarted.current) return

    anonymousSignInStarted.current = true

    const supabase = createAuthClient()

    supabase.auth.signInAnonymously().catch((error) => {
      anonymousSignInStarted.current = false
      console.error(error)
    })
  }, [hasSession])

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>

      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
