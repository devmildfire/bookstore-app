'use client'

import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/contexts/toast'

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

  // Sign in anonymously on first visit if no session exists
  useEffect(() => {
    if (!hasSession) {
      createClient().auth.signInAnonymously().catch(console.error)
    }
  }, [hasSession])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
