import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SUPABASE_AUTH_COOKIE_NAME } from '@/lib/supabase/authCookie'
import { PLACEHOLDER_ANON_KEY, SUPABASE_PROXY_PREFIX } from '@/lib/supabase/sameOrigin'

const CART_COOKIE = 'bookstore_cart_id'
// Non-HttpOnly hint read by the client (Providers) to gate anonymous sign-in,
// so the root layout doesn't need to read auth cookies (PPR-friendly).
const HAS_SESSION_COOKIE = 'bookstore_has_session'

// /profile is intentionally NOT protected here — anonymous users need to
// reach their cabinet to see orders + download links. The page itself
// handles the no-user fallback.
//
// /admin is admin-only and gated below on app_metadata.role; /admin/login is
// the gate-exempt entry point.
const ADMIN_LOGIN_PATH = '/admin/login'

export async function proxy(request: NextRequest) {
  // ── Same-origin Supabase proxy ──────────────────────────────────────────────
  // The browser only ever talks to its own origin under /sb/*; rewrite to the real
  // Supabase (runtime SUPABASE_INTERNAL_URL) and inject the real anon key here, so
  // the shipped image bakes NO env-specific Supabase host or key. Per-env config
  // (routing target + key) lives in runtime env, not the bundle. Returns before the
  // session/cart/admin logic — /sb is a pure pass-through to Supabase.
  if (request.nextUrl.pathname.startsWith(`${SUPABASE_PROXY_PREFIX}/`)) {
    const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const base = process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
    const upstreamPath = request.nextUrl.pathname.slice(SUPABASE_PROXY_PREFIX.length)
    const target = new URL(upstreamPath + request.nextUrl.search, base)
    const headers = new Headers(request.headers)
    headers.set('apikey', anonKey)
    // Anon requests send `Bearer <placeholder>` (or nothing); give them the real
    // anon key. A real user-JWT Authorization passes through untouched.
    const auth = headers.get('authorization')
    if (!auth || auth === `Bearer ${PLACEHOLDER_ANON_KEY}`) {
      headers.set('authorization', `Bearer ${anonKey}`)
    }
    return NextResponse.rewrite(target, { request: { headers } })
  }

  let response = NextResponse.next({ request })

  // /auth/callback owns its cookie writes — running getUser() here can
  // trigger a Supabase refresh that writes anon Set-Cookie headers, which
  // then race the route handler's mildfire Set-Cookie and sometimes win,
  // leaving the browser with stale anon tokens after a successful OAuth.
  // Skip the proxy's session work for this path; the route handler is the
  // sole authority for session cookies on the OAuth return leg.
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    if (!request.cookies.has(CART_COOKIE)) {
      response.cookies.set(CART_COOKIE, crypto.randomUUID(), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
    }
    return response
  }

  const supabase = createServerClient(
    // Per-request session refresh — use the internal kong URL when set so this
    // doesn't hairpin out to the public host on every request. Falls back to the
    // public URL (local dev, or if the var isn't available in this runtime).
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Pin cookie name to the public-url-derived value (the internal kong URL
      // would otherwise derive sb-kong-… and miss the browser's session cookie).
      cookieOptions: { name: SUPABASE_AUTH_COOKIE_NAME },
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

  // Refresh the session + read its claims. getClaims() verifies the JWT LOCALLY against the
  // JWKS public key (ES256 asymmetric — see docs/deployment/asymmetric-jwt-migration.md),
  // avoiding the per-request auth-server round-trip getUser() makes. It still calls
  // getSession() internally, so the SSR session refresh + cookie write are preserved. This
  // runs on every request, so trimming the round-trip cuts TTFB site-wide (notably on `/`).
  // Note: claims reflect token-issuance state — a *revoked* admin's token passes this cheap
  // pre-gate until it refreshes (≤ JWT TTL); the /admin (panel) layout's requireAdmin() is the
  // live, authoritative gate. (Under the legacy HS256 fallback getClaims behaves like getUser.)
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims as (Record<string, unknown> | undefined)
  const hasSession = Boolean(claims)

  // Set cart cookie on first visit (persists for 1 year)
  if (!request.cookies.has(CART_COOKIE)) {
    response.cookies.set(CART_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    })
  }

  // Non-HttpOnly hint cookie: does a session (anon OR real) already exist? The
  // client reads this in Providers to gate anonymous sign-in WITHOUT the root
  // layout reading auth cookies — which is what keeps app/layout static / PPR-
  // friendly (and drops the duplicate getUser() the layout used to make). It is
  // NOT a token, just a boolean. Refreshed every request so it stays accurate.
  // Anon sign-in stays client-side, so bots that don't run JS never create anon
  // users. (Skipped on the /auth/callback early-return above; the next request
  // re-syncs it.)
  response.cookies.set(HAS_SESSION_COOKIE, hasSession ? '1' : '0', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })

  // Gate the admin area: only users whose JWT carries app_metadata.role ===
  // 'admin' may pass. Everyone else is sent to the admin login. /admin/login
  // itself stays open so admins can sign in.
  const { pathname } = request.nextUrl
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminLogin = pathname === ADMIN_LOGIN_PATH

  if (isAdminArea && !isAdminLogin) {
    const role = (claims?.app_metadata as { role?: unknown } | undefined)?.role
    if (role !== 'admin') {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
      if (pathname !== '/admin') loginUrl.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    // Always run for /sb/* — even storage object paths ending in an image
    // extension (authenticated uploads/downloads need the injected apikey).
    '/sb/:path*',
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
