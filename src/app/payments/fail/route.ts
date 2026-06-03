import { type NextRequest, NextResponse } from 'next/server'
import { getPaymentConfig } from '@/lib/payments/config'
import { createAdminClient } from '@/lib/supabase/server'

// FailURL — the buyer cancelled or the payment failed. Robokassa sends InvId
// (no signed confirmation). We cancel the still-pending order (releasing any
// reserved gift cards; the cart is left intact so they can retry) and send them
// back to checkout. cancel_pending_order is idempotent and a no-op if the order
// already settled.

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

  if (Number.isInteger(invId) && invId > 0) {
    const supabase = createAdminClient()
    await supabase.rpc('cancel_pending_order', { p_order_id: invId })
  }

  return NextResponse.redirect(`${cfg.siteUrl}/checkout?payment=failed`, 303)
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
