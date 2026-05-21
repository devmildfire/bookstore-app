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
  const next = url.searchParams.get('next') ?? '/profile'

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'

  if (!code) {
    return NextResponse.redirect(new URL(safeNext, request.url))
  }

  const response = NextResponse.redirect(new URL(safeNext, request.url))

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const errorUrl = new URL('/', request.url)
    errorUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  return response
}
