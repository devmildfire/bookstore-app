import { type NextRequest, NextResponse } from 'next/server'
import { isMockProvider, getPaymentConfig } from '@/lib/payments/config'
import { initSignature, signaturesMatch } from '@/lib/payments/robokassa/signature'

// Stand-in for Robokassa's hosted entry point. The checkout auto-POSTs the
// same signed field set a real Robokassa redirect would carry; we verify our
// own init (Password1) signature — proving the production signer is correct —
// then hand the buyer to the interactive mock payment page. Disabled (404)
// whenever PAYMENT_PROVIDER ≠ mock.

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  if (!isMockProvider()) return new Response('Not found', { status: 404 })
  const cfg = getPaymentConfig()
  const form = await req.formData()
  const str = (k: string) => {
    const v = form.get(k)
    return typeof v === 'string' ? v : ''
  }

  const invId = str('InvId')
  const shp: Record<string, string> = {}
  for (const [k, v] of form.entries()) {
    if (k.startsWith('Shp_') && typeof v === 'string') shp[k] = v
  }

  const expected = initSignature({
    merchantLogin: str('MerchantLogin'),
    outSum: str('OutSum'),
    invId,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
    receipt: str('Receipt') || undefined,
    shp: Object.keys(shp).length ? shp : undefined,
  })
  if (!signaturesMatch(str('SignatureValue'), expected)) {
    return new Response('bad sign', { status: 400 })
  }

  return NextResponse.redirect(
    `${cfg.siteUrl}/payments/mock?invId=${encodeURIComponent(invId)}`,
    303
  )
}
