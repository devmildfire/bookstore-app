import { metrics } from '@/lib/metrics'

// Prometheus scrape endpoint. Scraped INTERNALLY by Prometheus at app:3000/metrics
// over the docker network; the public path bookstore-app.mildfire.dev/metrics is
// blocked at nginx (returns 404) so internal metrics aren't exposed to the world.
export const runtime = 'nodejs' // prom-client needs Node APIs, not the edge runtime
export const dynamic = 'force-dynamic'

export async function GET() {
  const body = await metrics.registry.metrics()
  return new Response(body, { headers: { 'Content-Type': metrics.registry.contentType } })
}
