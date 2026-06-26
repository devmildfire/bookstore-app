// Name of the auth-session cookie — a fixed CONSTANT shared by the browser client
// (src/lib/supabase/client.ts) and every server cookie-client (server.ts, proxy.ts).
//
// It must NOT be derived from a URL: the browser now talks to its own origin under
// /sb (same-origin proxy), so a host-derived name would compute
// `sb-<app-host>-auth-token` on the client but `sb-<supabase-host>-auth-token` on the
// server → the server would never find the browser's session cookie (empty cart,
// checkout "not_authenticated"). Pinning one constant on both sides keeps them in
// lock-step and is env-agnostic (one image, any environment).
//
// Value kept as the historical prod name so existing production sessions survive the
// switch. Edge-safe (no Node-only imports) so proxy.ts can import it.
export const SUPABASE_AUTH_COOKIE_NAME = 'sb-api-auth-token'
