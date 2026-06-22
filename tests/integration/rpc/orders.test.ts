import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasStack, adminClient, signInAnon, type Client } from '../stack'

// Two-phase order lifecycle against the real local Supabase stack (CI):
// create_pending_order → mark_order_paid (idempotent, amount-checked) →
// cancel_pending_order → expire_stale_pending_orders. Digital-only cart (EBook,
// no shipping). Skipped without the stack. See docs/testing/STRATEGY.md §3.
const EBOOK = { id: 'EBook-41', name: 'Белый цветок', price: 1000, category: 'EBook' as const, quantity: 1 }

describe.skipIf(!hasStack)('order lifecycle (anon session)', () => {
  let user: Client
  let admin: Client
  let uid: string

  const addItem = () => user.from('Cart').insert({ ...EBOOK })
  const getOrder = (id: number) => user.from('Orders').select('status, paid_at').eq('id', id).single()
  const cartCount = async () => ((await user.from('Cart').select('id')).data ?? []).length

  type CreatePayload = { status: string; orderId: number; amountDue?: number; finalTotal?: number }
  const createOrder = async (): Promise<CreatePayload> => {
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
    expect(error).toBeNull()
    return data as CreatePayload
  }

  beforeAll(async () => {
    admin = adminClient()
    ;({ client: user, uid } = await signInAnon())
    const { error: insertError } = await addItem()
    if (insertError) throw insertError
  })

  afterAll(async () => {
    if (uid) await admin.auth.admin.deleteUser(uid)
  })

  let paidOrderId: number
  let amountDue: number

  it('create_pending_order writes a pending order and leaves the cart intact', async () => {
    const p = await createOrder()
    expect(p.status).toBe('ok')
    paidOrderId = p.orderId
    amountDue = p.amountDue ?? p.finalTotal!
    expect(amountDue).toBe(1000)

    const { data: o } = await getOrder(paidOrderId)
    expect(o!.status).toBe('pending')
    expect(o!.paid_at).toBeNull()
    expect(await cartCount()).toBe(1) // two-phase: cart NOT wiped yet
  })

  it('mark_order_paid (correct amount) marks it paid and wipes the cart', async () => {
    const { data } = await admin.rpc('mark_order_paid', { p_inv_id: paidOrderId, p_out_sum: amountDue.toFixed(2) })
    expect((data as { status: string }).status).toBe('ok')

    const { data: o } = await getOrder(paidOrderId)
    expect(o!.status).toBe('paid')
    expect(o!.paid_at).not.toBeNull()
    expect(await cartCount()).toBe(0) // settled → cart wiped
  })

  it('mark_order_paid is idempotent (already paid → ok/alreadyPaid)', async () => {
    const { data } = await admin.rpc('mark_order_paid', { p_inv_id: paidOrderId, p_out_sum: amountDue.toFixed(2) })
    const p = data as { status: string; alreadyPaid?: boolean }
    expect(p.status).toBe('ok')
    expect(p.alreadyPaid).toBe(true)
  })

  it('mark_order_paid rejects an amount mismatch, then cancel_pending_order cancels it', async () => {
    await addItem() // cart was wiped above
    const p = await createOrder()

    const { data: bad } = await admin.rpc('mark_order_paid', { p_inv_id: p.orderId, p_out_sum: '0.01' })
    expect((bad as { status: string; reason?: string }).reason).toBe('amount_mismatch')

    const { data: c } = await user.rpc('cancel_pending_order', { p_order_id: p.orderId })
    expect((c as { status: string }).status).toBe('ok')
    const { data: o } = await getOrder(p.orderId)
    expect(o!.status).toBe('cancelled')
  })

  it('expire_stale_pending_orders clears an aged pending order', async () => {
    await addItem()
    const p = await createOrder()
    // Age it past the 7-day window (service role bypasses RLS).
    const eightDaysAgo = new Date(Date.now() - 8 * 864e5).toISOString()
    const { error: ageErr } = await admin.from('Orders').update({ created_at: eightDaysAgo }).eq('id', p.orderId)
    expect(ageErr).toBeNull()

    const { data: count, error } = await admin.rpc('expire_stale_pending_orders', { p_days: 7 })
    expect(error).toBeNull()
    expect(count as number).toBeGreaterThanOrEqual(1)

    const { data: o } = await getOrder(p.orderId)
    expect(o!.status).not.toBe('pending')
  })
})
