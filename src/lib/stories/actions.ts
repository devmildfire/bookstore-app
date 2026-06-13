'use server'

import { sendEmail } from '@/lib/email/send'
import AdminStorySubmission from '@/emails/AdminStorySubmission'

interface NotifyStorySubmissionInput {
  authorName: string
  coverLetter?: string
  path: string
}

/**
 * Email the editorial team that a manuscript was submitted. Best-effort: the
 * upload already succeeded, so a notification failure must not surface to the
 * author. Recipient comes from ADMIN_NOTIFICATIONS_EMAIL.
 */
export async function notifyStorySubmissionAction(input: NotifyStorySubmissionInput): Promise<void> {
  const to = process.env.ADMIN_NOTIFICATIONS_EMAIL
  if (!to) {
    console.warn('[story submission] ADMIN_NOTIFICATIONS_EMAIL is not set — skipping notification')
    return
  }
  try {
    await sendEmail({
      to,
      subject: `Новый рассказ на рассмотрение — ${input.authorName}`,
      react: AdminStorySubmission(input),
    })
  } catch (err) {
    console.error('[story submission] notify failed:', err)
  }
}
