import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { hasStack, adminClient, type Client } from '../stack'

// Audience sync is a best-effort side effect; mock it so the test is isolated from
// Resend and asserts only the token → DB-state contract.
vi.mock('@/lib/email/audience', () => ({
  addToAudience: vi.fn().mockResolvedValue(null),
  removeFromAudience: vi.fn().mockResolvedValue(undefined),
}))
import { GET as confirmGET } from '@/app/(site)/newsletter/confirm/route'
import { GET as unsubscribeGET } from '@/app/(site)/newsletter/unsubscribe/route'

// App-edge tests for the double-opt-in token handlers. Cookie-free (createAdminClient
// + SECURITY DEFINER RPCs), so import-and-invoke against the real stack. Tokens are
// UUIDs (confirm_newsletter / unsubscribe_newsletter take `p_token uuid`).
function get(path: string, token?: string): NextRequest {
  const url = new URL(`http://localhost${path}`)
  if (token !== undefined) url.searchParams.set('token', token)
  return new NextRequest(url)
}
const redirectStatus = (res: Response): string | null =>
  new URL(res.headers.get('location') ?? 'http://x/').searchParams.get('status')

describe.skipIf(!hasStack)('newsletter confirm / unsubscribe (token RPCs)', () => {
  let admin: Client
  const seededEmails: string[] = []

  async function seedSubscriber() {
    const email = `nl-${crypto.randomUUID()}@example.com`
    const confirmToken = crypto.randomUUID()
    const unsubscribeToken = crypto.randomUUID()
    const { error } = await admin
      .from('Subscribers')
      .insert({ email, confirm_token: confirmToken, unsubscribe_token: unsubscribeToken, status: 'pending' })
    if (error) throw error
    seededEmails.push(email)
    return { email, confirmToken, unsubscribeToken }
  }
  const statusOf = async (email: string): Promise<string | undefined> =>
    (await admin.from('Subscribers').select('status').eq('email', email).single()).data?.status

  beforeAll(() => {
    admin = adminClient()
  })
  afterAll(async () => {
    if (seededEmails.length) await admin.from('Subscribers').delete().in('email', seededEmails)
  })

  it('confirm with a valid token → confirmed + subscriber active', async () => {
    const s = await seedSubscriber()
    const res = await confirmGET(get('/newsletter/confirm', s.confirmToken))
    expect(redirectStatus(res)).toBe('confirmed')
    expect(await statusOf(s.email)).toBe('active')
  })

  it('confirm with an unknown token → invalid', async () => {
    const res = await confirmGET(get('/newsletter/confirm', crypto.randomUUID()))
    expect(redirectStatus(res)).toBe('invalid')
  })

  it('confirm with no token → invalid (before any RPC)', async () => {
    const res = await confirmGET(get('/newsletter/confirm'))
    expect(redirectStatus(res)).toBe('invalid')
  })

  it('unsubscribe with a valid token → unsubscribed + subscriber unsubscribed', async () => {
    const s = await seedSubscriber()
    const res = await unsubscribeGET(get('/newsletter/unsubscribe', s.unsubscribeToken))
    expect(redirectStatus(res)).toBe('unsubscribed')
    expect(await statusOf(s.email)).toBe('unsubscribed')
  })

  it('unsubscribe with an unknown token → invalid', async () => {
    const res = await unsubscribeGET(get('/newsletter/unsubscribe', crypto.randomUUID()))
    expect(redirectStatus(res)).toBe('invalid')
  })
})
