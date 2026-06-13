import { Resend } from 'resend'

// Single Resend client for all outbound mail. Server-only — never import from a
// Client Component (it would leak RESEND_API_KEY into the browser bundle).
//
// In Resend test mode (no verified sending domain yet) delivery is restricted to
// the account owner's address; other recipients are accepted but not delivered.
export const resend = new Resend(process.env.RESEND_API_KEY)

// Default From. Override per-send when needed. Until a real domain is verified in
// Resend, this stays on the shared test sender (see docs/plans/email-system.md T1).
export const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL ?? 'Чтиво <onboarding@resend.dev>'

// Absolute origin for links rendered into emails (confirm/reset/unsubscribe).
export const SITE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
