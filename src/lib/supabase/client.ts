// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>

declare global {
  var __supabaseBrowserClient: BrowserClient | undefined
}

export function createClient() {
  if (!globalThis.__supabaseBrowserClient) {
    globalThis.__supabaseBrowserClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          // Match the server. With tokens-only, the user object lives in
          // memory (userStorage default), and the cookies hold just access
          // and refresh tokens — small enough to avoid chunking.
          encode: 'tokens-only',
        },
      }
    )
  }

  return globalThis.__supabaseBrowserClient
}

export const createAuthClient = createClient