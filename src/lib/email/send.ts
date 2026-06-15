import type { ReactElement } from 'react'
import { getResend, DEFAULT_FROM } from './resend'

interface SendEmailArgs {
  to: string | string[]
  subject: string
  /** A React Email element — Resend renders it server-side. */
  react: ReactElement
  from?: string
  replyTo?: string
}

/**
 * Send one email through Resend. Throws on provider error — callers on a path
 * that must not fail (payment webhook, file upload) should wrap in try/catch and
 * log, never let an email failure break the primary action.
 *
 * Returns the Resend message id on success.
 */
export async function sendEmail({ to, subject, react, from = DEFAULT_FROM, replyTo }: SendEmailArgs): Promise<string> {
  const { data, error } = await getResend().emails.send({ from, to, subject, react, replyTo })
  if (error) throw new Error(`Resend send failed: ${error.message}`)
  if (!data?.id) throw new Error('Resend send returned no message id')
  return data.id
}
