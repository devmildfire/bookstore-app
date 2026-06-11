import { type NextRequest, NextResponse } from 'next/server'
import { getPaymentConfig } from '@/lib/payments/config'

// FailURL — the payment did not go through (bank declined, or the buyer backed
// out at the gateway). Robokassa sends only InvId with no signed confirmation
// and can't reliably tell a decline from a cancellation, so we do NOT cancel the
// order: it stays `pending` (unpaid but still payable). The buyer is sent to
// their order history, where the order shows a "банк отклонил платёж" notice and
// a "Завершить оплату" button to retry now or later — and it auto-expires after
// 7 days if abandoned (expire_stale_pending_orders).

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
  const params = await paramsFrom(req)
  const invId = Number(params.InvId)

  // The order is left `pending` — no cancellation. Point the buyer at the order
  // so they can retry payment; include its id when we have one.
  const target =
    Number.isInteger(invId) && invId > 0
      ? `${cfg.siteUrl}/profile/orders?payment=failed&order=${invId}`
      : `${cfg.siteUrl}/profile/orders?payment=failed`

  return NextResponse.redirect(target, 303)
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
