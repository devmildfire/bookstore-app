import { type NextRequest, NextResponse } from 'next/server'
import { getPaymentConfig } from '@/lib/payments/config'
import { createAdminClient } from '@/lib/supabase/server'
import { chargeSubscription } from '@/lib/payments/robokassa/recurring'

// Recurring-billing scheduler (skeleton). Charges every active subscription
// whose next_charge_at is due. Meant to be hit by a scheduler (Supabase cron /
// external cron) on an interval; guarded by the x-cron-secret shared secret.
// Real scheduling infra is out of scope — wire this URL into the scheduler when
// it lands. Same charge path as the manual test trigger.

export const dynamic = 'force-dynamic'

async function handle(req: NextRequest): Promise<Response> {
  const cfg = getPaymentConfig()
  const secret = req.headers.get('x-cron-secret')
  if (!secret || secret !== cfg.cronSecret) {
    return new Response('forbidden', { status: 401 })
  }

  const admin = createAdminClient()
  const { data: due, error } = await admin
    .from('UserSubscriptions')
    .select('id')
    .eq('status', 'active')
    .lte('next_charge_at', new Date().toISOString())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const results: Array<{ id: number; status: string; message?: string }> = []
  for (const row of due ?? []) {
    const res = await chargeSubscription(row.id)
    results.push(
      res.status === 'ok'
        ? { id: row.id, status: 'ok' }
        : { id: row.id, status: 'error', message: res.message }
    )
  }

  return NextResponse.json({ due: due?.length ?? 0, results })
}

export async function POST(req: NextRequest) {
  return handle(req)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
