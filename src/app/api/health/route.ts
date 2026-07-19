// Liveness probe: proves the Next.js server process is up and serving HTTP.
// Deliberately DEPENDENCY-FREE — no DB/Supabase/kong reads — so a transient
// dependency outage (e.g. a Postgres restart during a minor image upgrade) does
// NOT flip the app container to "unhealthy" and trigger a needless restart. The
// container HEALTHCHECK (Dockerfile) hits this. Readiness (dependency-aware)
// checks belong in the deploy smoke tests, not here — see
// docs/plans/infra-image-automation.md §0.
export const dynamic = 'force-dynamic' // never prerender/cache a health probe

export function GET() {
  return Response.json({ status: 'ok' }, { status: 200 })
}
