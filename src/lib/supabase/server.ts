import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'
import { SUPABASE_AUTH_COOKIE_NAME } from './authCookie'

// Base URL for server-side Supabase API calls. In production the app container
// reaches kong directly over the docker network (SUPABASE_INTERNAL_URL =
// http://kong:8000) instead of hairpinning out to the public api.mildfire.dev →
// Cloudflare → tunnel and back. Falls back to the public URL when unset (local
// dev, or any path where the internal hostname isn't resolvable).
//
// NOTE: only for clients that *fetch data / manage auth* server-side.
// createAdminClient stays on the PUBLIC url below — its createSignedUrl results
// are handed to the browser and must be publicly reachable.
const SERVER_SUPABASE_URL = process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!

// Auth client — uses SSR for cookie-based session management (Server Components & Server Actions)
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    SERVER_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Pin the cookie name to the PUBLIC-url-derived value (sb-api-auth-token).
      // SERVER_SUPABASE_URL points at kong internally, which would otherwise make
      // @supabase/ssr look for sb-kong-auth-token and miss the browser's session.
      cookieOptions: { name: SUPABASE_AUTH_COOKIE_NAME },
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
    SERVER_SUPABASE_URL,
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

// Admin client — uses the service-role key. ONLY use after explicit
// server-side authorization (e.g. the caller has been validated as the
// owner of the relevant Order). RLS does not apply — never expose this
// client to a code path that hasn't already done its own access check.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
