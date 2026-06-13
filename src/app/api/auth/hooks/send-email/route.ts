import { Webhook } from 'standardwebhooks'
import { sendEmail } from '@/lib/email/send'
import { SITE_URL } from '@/lib/email/resend'
import ConfirmSignup from '@/emails/ConfirmSignup'
import ResetPassword from '@/emails/ResetPassword'

// Supabase Auth "Send Email" hook. GoTrue POSTs here instead of sending auth
// emails itself; we render a React Email template and send via Resend. Wired in
// supabase/config.toml ([auth.hook.send_email]); secret = SEND_EMAIL_HOOK_SECRET.
// See docs/plans/email-system.md P1.

interface HookPayload {
  // `email` is empty for an email_change (incl. the anon→account upgrade); the
  // target address is in `new_email`. Always prefer new_email when present.
  user: { email: string; new_email?: string }
  email_data: {
    token_hash: string
    redirect_to: string
    email_action_type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change' | 'reauthentication'
    site_url: string
  }
}

// Build the verification link our /auth/confirm route understands (token_hash +
// type), with a post-confirm destination.
function confirmLink(tokenHash: string, type: string, next: string): string {
  const u = new URL('/auth/confirm', SITE_URL)
  u.searchParams.set('token_hash', tokenHash)
  u.searchParams.set('type', type)
  u.searchParams.set('next', next)
  return u.toString()
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.SEND_EMAIL_HOOK_SECRET
  if (!secret) {
    console.error('[send-email hook] SEND_EMAIL_HOOK_SECRET is not set')
    return Response.json({ error: { http_code: 500, message: 'hook not configured' } }, { status: 500 })
  }

  const payload = await request.text()
  const headers = Object.fromEntries(request.headers)

  let data: HookPayload
  try {
    // standardwebhooks wants the bare base64 secret; Supabase stores it as `v1,whsec_<base64>`.
    const wh = new Webhook(secret.replace(/^v1,whsec_/, ''))
    data = wh.verify(payload, headers) as HookPayload
  } catch (err) {
    console.error('[send-email hook] signature verification failed:', err)
    return Response.json({ error: { http_code: 401, message: 'invalid signature' } }, { status: 401 })
  }

  const { user, email_data } = data
  const { token_hash, email_action_type } = email_data

  // For email_change (incl. the anon→account upgrade) GoTrue leaves user.email
  // empty and puts the address being confirmed in new_email.
  const recipient = user.new_email || user.email
  if (!recipient) {
    console.error('[send-email hook] no recipient address in payload', { email_action_type })
    return Response.json({ error: { http_code: 400, message: 'no recipient' } }, { status: 400 })
  }

  try {
    if (email_action_type === 'recovery') {
      await sendEmail({
        to: recipient,
        subject: 'Сброс пароля — Чтиво',
        react: ResetPassword({ resetUrl: confirmLink(token_hash, 'recovery', '/auth/reset-password') }),
      })
    } else {
      const isEmailChange = email_action_type === 'email_change'
      await sendEmail({
        to: recipient,
        subject: isEmailChange ? 'Подтвердите смену email — Чтиво' : 'Подтвердите ваш email — Чтиво',
        react: ConfirmSignup({
          confirmUrl: confirmLink(token_hash, email_action_type, '/profile'),
          isEmailChange,
        }),
      })
    }
  } catch (err) {
    console.error('[send-email hook] send failed:', err)
    return Response.json({ error: { http_code: 500, message: 'send failed' } }, { status: 500 })
  }

  // 200 with empty body tells GoTrue the email was handled.
  return Response.json({})
}
