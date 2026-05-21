import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Auth client — uses SSR for cookie-based session management (Server Components & Server Actions)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Must match proxy.ts + /auth/callback so cookies are written and
        // read with the same encoding (tokens-only, no user-in-cookie).
        // See proxy.ts for the rationale.
        encode: 'tokens-only',
        getAll() {
          try {
            return cookieStore.getAll()
          } catch {
            return []
          }
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          headers: Record<string, string> = {}
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
            // No response object reachable from Server Components — these
            // headers are informational here; the middleware applies them
            // on its own pass.
            void headers
          } catch {
            // Server Components cannot write cookies — the middleware handles session refresh
          }
        },
      },
    }
  )
}

// Data client — uses anon key directly, no session management (for data fetching only)
export function createDataClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
      },
    }
  )
}
