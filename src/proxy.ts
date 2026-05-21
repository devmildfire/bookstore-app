import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const CART_COOKIE = 'bookstore_cart_id'

// /account is intentionally NOT protected here — anonymous users need to
// reach their cabinet to see orders + download links. The /account page
// itself handles the no-user fallback.
const PROTECTED_PREFIXES = ['/admin']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // `tokens-only` keeps only the access/refresh tokens in cookies and
        // pulls the user object via getUser() from the auth server. Keeps
        // cookies under the per-cookie size limit (Google OAuth sessions are
        // huge), avoiding the chunked-cookie reassembly path that's flaky
        // under Next.js webpack dev mode.
        // Must match the encode option used elsewhere (see lib/supabase/server.ts).
        encode: 'tokens-only',
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          headers: Record<string, string> = {}
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
          // 0.10.3+ asks us to apply caching headers when auth cookies change
          // so CDNs/proxies don't cache responses with auth tokens.
          Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v))
        },
      },
    }
  )

  // Refresh Supabase session — must run before any route checks
  const { data: { user } } = await supabase.auth.getUser()

  // Set cart cookie on first visit (persists for 1 year)
  if (!request.cookies.has(CART_COOKIE)) {
    response.cookies.set(CART_COOKIE, uuidv4(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  // Protect /account and /admin — redirect unauthenticated users to login
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (!user && isProtected) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
