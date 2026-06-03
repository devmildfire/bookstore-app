import { type NextRequest, NextResponse } from 'next/server'
import { parseAndVerifySuccess } from '@/lib/payments/robokassa/client'
import { getPaymentConfig } from '@/lib/payments/config'

// SuccessURL — the browser lands here after a successful payment. User-facing
// only; the ResultURL webhook is what actually marks the order paid (it may even
// arrive after this redirect). We verify the Password1 signature, then send the
// buyer to their order. The orders page reflects pending-vs-paid if Result is
// still in flight.

export const dynamic = 'force-dynamic'

async function paramsFrom(req: NextRequest): Promise<Record<string, string>> {
  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') ?? ''
    if (ct.includes('form')) {
      const form = await req.formData()
      const out: Record<string, string> = {}
      for (const [k, v] of form.entries()) out[k] = typeof v === 'string' ? v : ''
      return out
    }
  }
  return Object.fromEntries(req.nextUrl.searchParams)
}

async function handle(req: NextRequest): Promise<Response> {
  const cfg = getPaymentConfig()
  const verified = parseAndVerifySuccess(await paramsFrom(req))

  if (!verified.valid) {
    return NextResponse.redirect(`${cfg.siteUrl}/checkout?payment=error`, 303)
  }
  return NextResponse.redirect(
    `${cfg.siteUrl}/profile/orders?from=checkout&order=${verified.invId}`,
    303
  )
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
