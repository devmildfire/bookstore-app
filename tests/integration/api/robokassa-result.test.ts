import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { hasStack, adminClient, signInAnon, formPostRequest, type Client } from '../stack'
import { resultSignature } from '@/lib/payments/robokassa/signature'
import { getPaymentConfig } from '@/lib/payments/config'

// The order-confirmation email is a best-effort side effect of a paid order; mock
// it so these tests don't depend on Resend / the email-claim table. We assert the
// PAYMENT behaviour, not the email.
vi.mock('@/lib/email/sendOrderConfirmation', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))

// Imported after the mock (vi.mock is hoisted, so a top-level import is fine).
import { POST } from '@/app/api/payments/robokassa/result/route'

// App-edge test for the ResultURL webhook — the source of truth for payment.
// Exercises the HTTP boundary the RPC tests can't: the Password2 signature gate,
// amount checking, and idempotency, end-to-end against the real stack.
const URL = 'http://localhost/api/payments/robokassa/result'
const EBOOK = { id: 'EBook-41', name: 'Белый цветок', price: 1000, category: 'EBook' as const, quantity: 1 }

// A correctly-signed Result callback for (invId, outSum) using the mock Password2.
function signedParams(invId: number, outSum: string): Record<string, string> {
  const cfg = getPaymentConfig()
  const sig = resultSignature({ outSum, invId, password2: cfg.password2, algo: cfg.hashAlgo })
  return { OutSum: outSum, InvId: String(invId), SignatureValue: sig }
}

describe.skipIf(!hasStack)('robokassa ResultURL webhook (HTTP handler)', () => {
  let user: Client
  let admin: Client
  let uid: string

  // A fresh pending order; returns its id + the exact OutSum string the gateway
  // would send (amountDue, 2dp — matches create_pending_order / formatOutSum).
  async function newPendingOrder(): Promise<{ id: number; outSum: string }> {
    // Reset the cart to exactly one item — tests that don't pay leave it populated
    // (only mark_order_paid wipes it), and a duplicate insert would violate the PK.
    await user.from('Cart').delete().eq('id', EBOOK.id)
    const { error: cartErr } = await user.from('Cart').insert({ ...EBOOK })
    if (cartErr) throw cartErr
    const { data, error } = await user.rpc('create_pending_order', {
      p_provider: 'mock',
      p_shipping_name: '',
      p_shipping_phone: '',
      p_shipping_city: '',
      p_shipping_street: '',
      p_shipping_building: '',
      p_shipping_postal_code: '',
      p_email: 'test@example.com',
    })
    if (error) throw error
    const p = data as { orderId: number; amountDue?: number; finalTotal?: number }
    return { id: p.orderId, outSum: (p.amountDue ?? p.finalTotal!).toFixed(2) }
  }

  const statusOf = async (id: number): Promise<string | undefined> =>
    (await admin.from('Orders').select('status').eq('id', id).single()).data?.status

  beforeAll(async () => {
    admin = adminClient()
    ;({ client: user, uid } = await signInAnon())
  })
  afterAll(async () => {
    if (uid) await admin.auth.admin.deleteUser(uid) // FK cascade wipes the test orders
  })

  it('valid signature + correct amount → "OK{invId}" and order paid', async () => {
    const o = await newPendingOrder()
    const res = await POST(formPostRequest(URL, signedParams(o.id, o.outSum)))
    expect(res.status).toBe(200)
    expect(await res.text()).toBe(`OK${o.id}`)
    expect(await statusOf(o.id)).toBe('paid')
  })

  it('bad signature → 400 and order stays pending', async () => {
    const o = await newPendingOrder()
    const res = await POST(
      formPostRequest(URL, { OutSum: o.outSum, InvId: String(o.id), SignatureValue: 'deadbeef' }),
    )
    expect(res.status).toBe(400)
    expect(await statusOf(o.id)).toBe('pending')
  })

  it('amount mismatch (validly signed for the wrong sum) → 500, order stays pending', async () => {
    const o = await newPendingOrder()
    // Signature is valid, but for an OutSum that does not match the order total.
    const res = await POST(formPostRequest(URL, signedParams(o.id, '0.01')))
    expect(res.status).toBe(500)
    expect(await statusOf(o.id)).toBe('pending')
  })

  it('duplicate callback is idempotent → still paid, "OK" both times', async () => {
    const o = await newPendingOrder()
    const first = await POST(formPostRequest(URL, signedParams(o.id, o.outSum)))
    const second = await POST(formPostRequest(URL, signedParams(o.id, o.outSum)))
    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(await second.text()).toBe(`OK${o.id}`)
    expect(await statusOf(o.id)).toBe('paid')
  })
})
