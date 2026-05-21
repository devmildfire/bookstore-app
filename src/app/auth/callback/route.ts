import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

// Server-side OAuth callback. Receives the PKCE `code` from Supabase after
// the provider flow completes, exchanges it for a session server-side, and
// writes the new auth cookies directly onto the redirect response so the
// browser arrives at the next page already authenticated.
//
// We can't use the shared @/lib/supabase/server helper here because Route
// Handler cookies set via `cookies().set()` are not always preserved across
// a `NextResponse.redirect`. Attaching cookies to the response object
// explicitly avoids that footgun.

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const errorParam = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const next = url.searchParams.get('next') ?? '/profile'

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'

  // Diagnostic logging — Server Action logs show in dev. Remove once stable.
  console.log('[/auth/callback] hit', {
    hasCode: !!code,
    next: safeNext,
    error: errorParam,
    errorDescription,
  })

  if (errorParam) {
    const errorUrl = new URL('/', request.url)
    errorUrl.searchParams.set('auth_error', errorDescription ?? errorParam)
    return NextResponse.redirect(errorUrl)
  }

  if (!code) {
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  const response = NextResponse.redirect(new URL(safeNext, request.url))

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // See proxy.ts for the why — keeps cookies small to avoid chunking.
        encode: 'tokens-only',
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          headers: Record<string, string> = {}
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  console.log('[/auth/callback] exchangeCodeForSession', {
    error: error?.message ?? null,
    userId: data?.user?.id ?? null,
    isAnonymous: data?.user?.is_anonymous ?? null,
    cookieCount: response.cookies.getAll().length,
  })
  if (error) {
    const errorUrl = new URL('/', request.url)
    errorUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  return response
}
