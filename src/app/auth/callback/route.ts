import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Server-side OAuth callback. Receives the PKCE `code` from Supabase after
// the provider flow completes, exchanges it for a session server-side (so
// the new auth cookies are written HTTP-only on the app's own origin), then
// redirects to the `next` target (default: /profile).
//
// Pattern documented at:
// https://supabase.com/docs/guides/auth/server-side/nextjs

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/profile'

  // Hard sanity: only allow same-origin relative paths in `next`.
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/profile'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(safeNext, request.url))
    }
    // Exchange failed — bounce to the home page so the user isn't stuck.
    const errorUrl = new URL('/', request.url)
    errorUrl.searchParams.set('auth_error', error.message)
    return NextResponse.redirect(errorUrl)
  }

  // No code in URL — return them to /profile silently.
  return NextResponse.redirect(new URL(safeNext, request.url))
}
