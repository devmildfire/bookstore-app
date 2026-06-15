import { Resend } from 'resend'

let client: Resend | null = null

// Single Resend client for all outbound mail, constructed lazily on first use.
// Lazy (not at module load) so build-time page-data collection doesn't require
// RESEND_API_KEY — `new Resend()` throws on a missing key, which would fail the
// production image build (the key is a runtime-only secret). Server-only — never
// import from a Client Component (it would leak RESEND_API_KEY into the browser).
//
// In Resend test mode (no verified sending domain yet) delivery is restricted to
// the account owner's address; other recipients are accepted but not delivered.
export function getResend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

// Default From. Override per-send when needed. Until a real domain is verified in
// Resend, this stays on the shared test sender (see docs/plans/email-system.md T1).
export const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL ?? 'Чтиво <onboarding@resend.dev>'

// Absolute origin for links rendered into emails (confirm/reset/unsubscribe).
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
