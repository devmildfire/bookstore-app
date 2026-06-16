// Name of the auth-session cookie. The browser supabase client derives it from
// NEXT_PUBLIC_SUPABASE_URL as `sb-<first-hostname-label>-auth-token` (supabase-js
// default: `sb-${new URL(url).hostname.split('.')[0]}-auth-token`).
//
// Our server cookie-clients talk to kong over the INTERNAL url (SUPABASE_INTERNAL_URL,
// http://kong:8000) for performance. Left to derive its own name, the server would
// compute `sb-kong-auth-token` and never find the browser's `sb-api-auth-token`
// cookie — so server-side getUser()/RLS sees no session (empty cart, checkout
// "not_authenticated"). Pin the cookie name to the PUBLIC-url-derived value so it
// matches the browser regardless of which host the server calls. Edge-safe (no
// Node-only imports) so proxy.ts can import it.
const PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'

export const SUPABASE_AUTH_COOKIE_NAME = `sb-${new URL(PUBLIC_SUPABASE_URL).hostname.split('.')[0]}-auth-token`
