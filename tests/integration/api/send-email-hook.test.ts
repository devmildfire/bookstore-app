import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest'
import { Webhook } from 'standardwebhooks'

// Mock the actual send so these tests don't hit Resend; we assert the recipient
// + that a rejected signature sends NOTHING.
vi.mock('@/lib/email/send', () => ({ sendEmail: vi.fn().mockResolvedValue(undefined) }))
import { sendEmail } from '@/lib/email/send'
import { POST } from '@/app/api/auth/hooks/send-email/route'

// App-edge test for the GoTrue Send-Email hook — a security boundary: GoTrue
// POSTs here and we MUST reject anything not signed with SEND_EMAIL_HOOK_SECRET.
// No Supabase / cookies — pure signature-verify + render + send. Standard-Webhooks
// wants the bare base64 secret; the handler strips the `v1,whsec_` prefix.
const SECRET_B64 = Buffer.from('integration-test-send-email-hook-secret').toString('base64')

function hookRequest(payload: object, opts: { secret?: string; tamper?: boolean } = {}): Request {
  const body = JSON.stringify(payload)
  const id = 'msg_test_1'
  const ts = new Date()
  let sig = new Webhook(opts.secret ?? SECRET_B64).sign(id, ts, body)
  if (opts.tamper) sig = `${sig.slice(0, -4)}XXXX`
  return new Request('http://localhost/api/auth/hooks/send-email', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': Math.floor(ts.getTime() / 1000).toString(),
      'webhook-signature': sig,
    },
    body,
  })
}

const signup = (over: Record<string, unknown> = {}) => ({
  user: { email: 'new@example.com', is_anonymous: false },
  email_data: { token_hash: 'th', redirect_to: '', email_action_type: 'signup', site_url: 'http://localhost:3000' },
  ...over,
})
const recipientOf = (call = 0) => (vi.mocked(sendEmail).mock.calls[call][0] as { to: string }).to

describe('/api/auth/hooks/send-email (Standard-Webhooks signature gate)', () => {
  beforeAll(() => vi.stubEnv('SEND_EMAIL_HOOK_SECRET', `v1,whsec_${SECRET_B64}`))
  afterAll(() => vi.unstubAllEnvs())
  beforeEach(() => vi.mocked(sendEmail).mockClear())

  it('valid signature → 200 and sends to user.email', async () => {
    const res = await POST(hookRequest(signup()))
    expect(res.status).toBe(200)
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(recipientOf()).toBe('new@example.com')
  })

  it('email_change prefers new_email as the recipient', async () => {
    const res = await POST(
      hookRequest({
        user: { email: '', new_email: 'changed@example.com', is_anonymous: false },
        email_data: { token_hash: 'th', redirect_to: '', email_action_type: 'email_change', site_url: 'http://localhost:3000' },
      }),
    )
    expect(res.status).toBe(200)
    expect(recipientOf()).toBe('changed@example.com')
  })

  it('tampered signature → 401 and sends nothing', async () => {
    const res = await POST(hookRequest(signup(), { tamper: true }))
    expect(res.status).toBe(401)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('signed with the wrong secret → 401', async () => {
    const res = await POST(hookRequest(signup(), { secret: Buffer.from('a-different-secret').toString('base64') }))
    expect(res.status).toBe(401)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('valid signature but no recipient address → 400', async () => {
    const res = await POST(
      hookRequest({
        user: { email: '', is_anonymous: false },
        email_data: { token_hash: 'th', redirect_to: '', email_action_type: 'email_change', site_url: 'http://localhost:3000' },
      }),
    )
    expect(res.status).toBe(400)
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
