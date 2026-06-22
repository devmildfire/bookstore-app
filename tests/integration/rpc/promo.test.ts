import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { hasStack, adminClient, signInAnon, type Client } from '../stack'
import { parseCartQuote } from '@/api/cart/quoteCart'

// Money path against the real local Supabase stack (CI). Exercises apply_promo_code
// over the 5 seeded codes (docs/testing/promo-codes.md) + quote_cart math, with a
// real anonymous session (both RPCs resolve the cart from auth.uid()). Skipped
// without the stack. See docs/testing/STRATEGY.md §3 Layer 2.
type PromoPayload = { status: 'ok' | 'error'; reason?: string }
const promo = (data: unknown) => data as PromoPayload

describe.skipIf(!hasStack)('apply_promo_code + quote_cart (anon session)', () => {
  let user: Client // anon-authed: its cart is the unit under test
  let admin: Client // service role: teardown
  let uid: string

  beforeAll(async () => {
    admin = adminClient()
    ;({ client: user, uid } = await signInAnon())
    // WHITE30 targets *title* 58 ("Белый цветок"). A cart id is `<kind>-<editionId>`
    // and the promo maps edition → title, so the line must be title 58's print
    // edition. Derive its id from the seed (robust to id changes).
    const { data: edition, error: edErr } = await user
      .from('Editions')
      .select('id')
      .eq('title_id', 58)
      .eq('kind', 'PrintBook')
      .single()
    if (edErr) throw edErr
    // user_id defaults to auth.uid(); RLS allows the owner to insert.
    const { error: insertError } = await user
      .from('Cart')
      .insert({ id: `PrintBook-${edition.id}`, name: 'Белый цветок', price: 1000, category: 'PrintBook', quantity: 1 })
    if (insertError) throw insertError
  })

  afterAll(async () => {
    // Deleting the auth user cascades Cart + CartPromo — no leftover rows.
    if (uid) await admin.auth.admin.deleteUser(uid)
  })

  it('applies a valid cart-level code (SUMMER25, 20%)', async () => {
    const { data, error } = await user.rpc('apply_promo_code', { input_code: 'SUMMER25' })
    expect(error).toBeNull()
    expect(promo(data).status).toBe('ok')
  })

  it('is case-insensitive', async () => {
    const { data } = await user.rpc('apply_promo_code', { input_code: 'summer25' })
    expect(promo(data).status).toBe('ok')
  })

  it('rejects an expired code (OLDCODE)', async () => {
    const { data } = await user.rpc('apply_promo_code', { input_code: 'OLDCODE' })
    expect(promo(data).status).toBe('error')
  })

  it('rejects an unknown code', async () => {
    const { data } = await user.rpc('apply_promo_code', { input_code: 'NO_SUCH_CODE_XYZ' })
    const p = promo(data)
    expect(p.status).toBe('error')
    expect(p.reason).toBe('not_found')
  })

  it('applies an item-level code whose target IS in the cart (WHITE30 → title 58)', async () => {
    const { data } = await user.rpc('apply_promo_code', { input_code: 'WHITE30' })
    expect(promo(data).status).toBe('ok')
  })

  it('rejects an item-level code whose target is NOT in the cart (AUDIO50 → AudioBook-4)', async () => {
    const { data } = await user.rpc('apply_promo_code', { input_code: 'AUDIO50' })
    const p = promo(data)
    expect(p.status).toBe('error')
    expect(p.reason).toBe('target_missing')
  })

  it('quote_cart reflects the cart-level discount (1000 → 20% → 800)', async () => {
    await user.rpc('apply_promo_code', { input_code: 'SUMMER25' })
    const { data, error } = await user.rpc('quote_cart')
    expect(error).toBeNull()
    const quote = parseCartQuote(data)
    expect(quote.subtotal).toBe(1000)
    expect(quote.discountAmount).toBe(200)
    expect(quote.total).toBe(800)
  })
})
