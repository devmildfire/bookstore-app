// src/lib/supabase/client.ts
import { createBrowserClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'
import { PLACEHOLDER_ANON_KEY, SUPABASE_PROXY_PREFIX } from '@/lib/supabase/sameOrigin'
import { SUPABASE_AUTH_COOKIE_NAME } from '@/lib/supabase/authCookie'

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>

declare global {
  var __supabaseBrowserClient: BrowserClient | undefined
}

// document.cookie ↔ supabase-ssr cookie adapter for the browser. The SDK
// uses these to read the access_token / refresh_token cookies set by the
// server (which are NOT HttpOnly precisely so JS can read them). Without
// them, the SDK throws "createBrowserClient requires configuring getAll
// and setAll cookie methods" on any API call (e.g. avatar upload).
function getAll() {
  if (typeof document === 'undefined') return []
  return document.cookie
    .split('; ')
    .filter(Boolean)
    .map((entry) => {
      const eq = entry.indexOf('=')
      const name = eq === -1 ? entry : entry.slice(0, eq)
      const value = eq === -1 ? '' : decodeURIComponent(entry.slice(eq + 1))
      return { name, value }
    })
}

function setAll(
  cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>
) {
  if (typeof document === 'undefined') return
  cookiesToSet.forEach(({ name, value, options = {} }) => {
    const parts = [`${name}=${encodeURIComponent(value)}`]
    if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`)
    parts.push(`Path=${options.path ?? '/'}`)
    if (options.domain) parts.push(`Domain=${options.domain}`)
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)
    if (options.secure) parts.push('Secure')
    // httpOnly can't be set from JS — it's a no-op flag on document.cookie.
    document.cookie = parts.join('; ')
  })
}

export function createClient() {
  if (typeof window === 'undefined') {
    throw new Error(
      'Browser supabase client was called server-side. ' +
        'Import createClient from @/lib/supabase/server in Server Components / Actions.'
    )
  }
  if (!globalThis.__supabaseBrowserClient) {
    // Talk to our OWN origin under /sb — the middleware (src/proxy.ts) rewrites it
    // to the real Supabase and injects the real anon key. Both args here are
    // constants (origin is runtime-derived, key is a placeholder the proxy swaps),
    // so nothing env-specific is baked into the bundle → one image, any environment.
    globalThis.__supabaseBrowserClient = createBrowserClient<Database>(
      `${window.location.origin}${SUPABASE_PROXY_PREFIX}`,
      PLACEHOLDER_ANON_KEY,
      {
        // Pin the cookie name to the shared constant so the server reads the same
        // cookie (the /sb origin would otherwise derive a different name from the
        // app host — see authCookie.ts).
        cookieOptions: { name: SUPABASE_AUTH_COOKIE_NAME },
        cookies: {
          // Match the server. With tokens-only, the user object lives in
          // localStorage (default userStorage), and the cookies hold just
          // the access + refresh tokens — small enough to avoid chunking.
          encode: 'tokens-only',
          getAll,
          setAll,
        },
      }
    )
  }

  return globalThis.__supabaseBrowserClient
}

export const createAuthClient = createClient
