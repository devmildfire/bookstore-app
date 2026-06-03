import { type NextRequest, NextResponse } from 'next/server'
import { isMockProvider, getPaymentConfig } from '@/lib/payments/config'
import { createAdminClient } from '@/lib/supabase/server'
import { formatOutSum, resultSignature, successSignature } from '@/lib/payments/robokassa/signature'

// The mock gateway's "result" of a payment attempt. On "pay" it does exactly
// what Robokassa does: signs the ResultURL notification with Password2, calls
// our own ResultURL server-to-server (which marks the order paid), then redirects
// the browser to SuccessURL (signed with Password1). On decline/cancel it sends
// the buyer to FailURL. Amount comes from the DB, never the client. 404 unless
// PAYMENT_PROVIDER=mock.

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isMockProvider()) return new Response('Not found', { status: 404 })

  const cfg = getPaymentConfig()
  const form = await req.formData()
  const invId = Number(form.get('invId'))
  const action = String(form.get('action') ?? 'pay')

  if (!Number.isInteger(invId) || invId <= 0) {
    return NextResponse.redirect(`${cfg.siteUrl}/checkout?payment=error`, 303)
  }

  // Cancel / simulated decline → FailURL.
  if (action !== 'pay') {
    return NextResponse.redirect(`${cfg.siteUrl}/payments/fail?InvId=${invId}`, 303)
  }

  const supabase = createAdminClient()
  const { data: order } = await supabase
    .from('Orders')
    .select('amount_due')
    .eq('id', invId)
    .single()
  if (!order) {
    return NextResponse.redirect(`${cfg.siteUrl}/checkout?payment=error`, 303)
  }
  const outSum = formatOutSum(order.amount_due)

  // 1) Notify our ResultURL server-to-server (Password2 signature).
  const resultBody = new URLSearchParams({
    OutSum: outSum,
    InvId: String(invId),
    SignatureValue: resultSignature({
      outSum,
      invId,
      password2: cfg.password2,
      algo: cfg.hashAlgo,
    }),
  })
  const resultRes = await fetch(cfg.resultUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: resultBody,
  })
  const resultText = (await resultRes.text()).trim()
  if (!resultText.toUpperCase().startsWith('OK')) {
    // ResultURL rejected — treat as a failed payment.
    return NextResponse.redirect(`${cfg.siteUrl}/payments/fail?InvId=${invId}`, 303)
  }

  // 2) Redirect the buyer to SuccessURL (Password1 signature).
  const successSig = successSignature({
    outSum,
    invId,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
  })
  const successUrl = new URL(cfg.successUrl)
  successUrl.searchParams.set('OutSum', outSum)
  successUrl.searchParams.set('InvId', String(invId))
  successUrl.searchParams.set('SignatureValue', successSig)
  return NextResponse.redirect(successUrl.toString(), 303)
}
