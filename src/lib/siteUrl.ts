// Trusted public origin for building absolute redirect URLs in route handlers.
//
// Behind the Cloudflare Tunnel, request.url / request.nextUrl.origin / the Host
// header are unreliable — they resolve to the container's bind address
// (0.0.0.0:3000), which then leaks into redirect Location headers and OAuth
// redirect_to values. Always build cross-page redirects from this explicit
// origin instead. (Read at runtime on the server — NEXT_PUBLIC_BASE_URL is set
// in the container env; same source the payments config + email links use.)
// `||` (not `??`) so an empty-string env (CI build with the var unset) falls
// back to a valid origin instead of '' (which would make `new URL(path, '')`
// throw in the redirect routes). At runtime the real base URL is always present.
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
