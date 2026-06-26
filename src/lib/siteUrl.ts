// Trusted public origin for building absolute redirect / callback URLs in route
// handlers and server actions.
//
// Why APP_BASE_URL (runtime) before NEXT_PUBLIC_BASE_URL (build-baked): for a
// single image to run in any environment, the origin used for RUNTIME redirects
// and payment callbacks must come from runtime env — `NEXT_PUBLIC_*` is inlined
// at build, so the CI image would otherwise carry the prod origin and misdirect
// redirects. `APP_BASE_URL` is set per-instance at runtime (compose / docker -e);
// it falls back to the build-baked public URL for local dev / prod default.
//
// A FUNCTION, not a module const: a const is evaluated once, so if an SSG page
// triggered it at build time the runtime value would be frozen to the build env.
// Reading env per call keeps each context (build SSG vs runtime request) correct.
//
// (Behind the Cloudflare Tunnel, request.url / nextUrl.origin / Host resolve to
// the container bind address 0.0.0.0:3000 — never derive the origin from those.)
export function getSiteOrigin(): string {
  return (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
}
