import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { hasStack, signInAnon, adminClient, type Client } from '../stack'
import type { PlaceOrderInput } from '@/api/orders/createPendingOrder'

// startCheckoutAction is a cookie-based server action (createPendingOrder →
// createClient()). Point its Supabase clients at stack-backed clients for a real
// anon user so the action runs end-to-end against the local stack. The hoisted
// holder is assigned in beforeAll; the mock reads it at call time.
const supa = vi.hoisted(() => ({ user: null as Client | null, admin: null as Client | null }))
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => supa.user),
  createAdminClient: vi.fn(() => supa.admin),
}))
vi.mock('@/lib/email/sendOrderConfirmation', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))
import { startCheckoutAction } from '@/lib/orders/actions'

const EBOOK = { id: 'EBook-41', name: 'Белый цветок', price: 1000, category: 'EBook' as const, quantity: 1 }
const baseInput: PlaceOrderInput = {
  shippingName: null,
  shippingPhone: null,
  shippingCity: null,
  shippingStreet: null,
  shippingBuilding: null,
  shippingPostalCode: null,
  email: 'test@example.com',
  giftCards: [],
}

describe.skipIf(!hasStack)('startCheckoutAction (server action — money path)', () => {
  let uid: string
  const resetCartToOneItem = async () => {
    await supa.user!.from('Cart').delete().eq('id', EBOOK.id)
    const { error } = await supa.user!.from('Cart').insert({ ...EBOOK })
    if (error) throw error
  }
  const clearCart = () => supa.user!.from('Cart').delete().eq('id', EBOOK.id)

  beforeAll(async () => {
    const s = await signInAnon()
    supa.user = s.client
    uid = s.uid
    supa.admin = adminClient()
  })
  afterAll(async () => {
    if (uid) await supa.admin!.auth.admin.deleteUser(uid) // FK cascade wipes orders
  })

  it('empty cart → error (empty_cart), no order created', async () => {
    await clearCart()
    const res = await startCheckoutAction(baseInput)
    expect(res.status).toBe('error')
    if (res.status === 'error') expect(res.reason).toBe('empty_cart')
  })

  it('a gift card that is not the user’s → error (invalid_gift_cards), order not taken', async () => {
    await resetCartToOneItem()
    const res = await startCheckoutAction({ ...baseInput, giftCards: [{ id: crypto.randomUUID(), amount: 500 }] })
    expect(res.status).toBe('error')
    if (res.status === 'error') expect(res.reason).toBe('invalid_gift_cards')
  })

  it('a normal (paid) cart → redirect with a signed gateway POST + a pending order', async () => {
    await resetCartToOneItem()
    const res = await startCheckoutAction(baseInput)
    expect(res.status).toBe('redirect')
    if (res.status === 'redirect') {
      expect(res.redirect.method).toBe('POST')
      expect(res.redirect.fields.SignatureValue).toBeTruthy()
      const { data } = await supa.admin!.from('Orders').select('status').eq('id', res.orderId).single()
      expect(data?.status).toBe('pending')
    }
  })
})
