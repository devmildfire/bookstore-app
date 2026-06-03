import { type NextRequest } from 'next/server'
import { parseAndVerifyResult, buildResultResponse } from '@/lib/payments/robokassa/client'
import { createAdminClient } from '@/lib/supabase/server'

// Robokassa ResultURL webhook — the source of truth for payment. Robokassa
// (or the mock gateway) calls this server-to-server after a payment. We verify
// the Password2 signature, mark the order paid (idempotent), and MUST answer
// with the literal "OK{InvId}". Any other response makes Robokassa retry.
//
// Runs with no user session → uses the service-role client, but only AFTER the
// signature check has authenticated the request as coming from Robokassa.

export const dynamic = 'force-dynamic'

async function toParams(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get('content-type') ?? ''
  if (ct.includes('form')) {
    const form = await req.formData()
    const out: Record<string, string> = {}
    for (const [k, v] of form.entries()) out[k] = typeof v === 'string' ? v : ''
    return out
  }
  return Object.fromEntries(req.nextUrl.searchParams)
}

async function handle(params: Record<string, string>): Promise<Response> {
  const verified = parseAndVerifyResult(params)
  if (!verified.valid) {
    return new Response(`bad sign: ${verified.reason}`, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc('mark_order_paid', {
    p_inv_id: verified.invId,
    p_out_sum: verified.outSum,
  })

  if (error) {
    return new Response('error', { status: 500 })
  }
  const payload = data as { status: string; reason?: string }
  if (payload?.status !== 'ok') {
    return new Response(`error: ${payload?.reason ?? 'unknown'}`, { status: 500 })
  }

  return new Response(buildResultResponse(verified.invId), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) {
  return handle(await toParams(req))
}

export async function GET(req: NextRequest) {
  return handle(Object.fromEntries(req.nextUrl.searchParams))
}
