// Smoke-test the Resend setup (P0 acceptance). Sends one plain email.
//
//   node --env-file=.env scripts/test-email.mjs you@your-resend-account.com
//
// In Resend test mode (no verified domain), `to` MUST be your Resend account
// owner address — anything else is accepted but silently not delivered.
// This script is a throwaway dev aid; safe to delete once real templates send.
import { Resend } from 'resend'

const to = process.argv[2]
if (!to) {
  console.error('Usage: node --env-file=.env scripts/test-email.mjs <recipient>')
  process.exit(1)
}
if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set (use --env-file=.env)')
  process.exit(1)
}

const from = process.env.RESEND_FROM_EMAIL || 'Чтиво <onboarding@resend.dev>'
const resend = new Resend(process.env.RESEND_API_KEY)

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: 'Чтиво — проверка почты',
  html: '<div style="font-family:Arial,sans-serif;color:#E0E0E0;background:#1A1A1A;padding:24px;border-radius:12px"><b style="color:#A10202">ЧТИВО</b><p>Resend настроен. Это тестовое письмо.</p></div>',
})

if (error) {
  console.error('Send failed:', error)
  process.exit(1)
}
console.log('Sent. Message id:', data?.id)
