import { type NextRequest } from 'next/server'
import { isMockProvider, getPaymentConfig } from '@/lib/payments/config'
import { recurringSignature, resultSignature, signaturesMatch } from '@/lib/payments/robokassa/signature'

// Stand-in for Robokassa's /Merchant/Recurring. A merchant-initiated recurring
// charge POSTs here with the new InvId, the anchor PreviousInvoiceID, OutSum and
// the Password1 signature. We verify it, then — like Robokassa — notify our own
// ResultURL (Password2) to settle the new order and answer "OK{InvId}". 404
// unless PAYMENT_PROVIDER=mock.

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isMockProvider()) return new Response('Not found', { status: 404 })

  const cfg = getPaymentConfig()
  const form = await req.formData()
  const str = (k: string) => {
    const v = form.get(k)
    return typeof v === 'string' ? v : ''
  }

  const merchantLogin = str('MerchantLogin')
  const invId = str('InvId')
  const outSum = str('OutSum')
  const received = str('SignatureValue')
  if (!invId || !outSum) return new Response('missing params', { status: 400 })

  const expected = recurringSignature({
    merchantLogin,
    outSum,
    invId,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
  })
  if (!signaturesMatch(received, expected)) {
    return new Response('bad sign', { status: 400 })
  }

  // Notify our ResultURL exactly like a one-time payment.
  const resultBody = new URLSearchParams({
    OutSum: outSum,
    InvId: invId,
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
    return new Response('result rejected', { status: 502 })
  }

  return new Response(`OK${invId}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
