import { resend } from './resend'

// Resend Audience sync for the mailing list. No-ops when RESEND_AUDIENCE_ID is
// unset (e.g. before the Audience is created — T2), so the local DB stays the
// source of truth and sync is purely additive. All failures are swallowed.

export async function addToAudience(email: string): Promise<string | null> {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) return null
  try {
    const { data, error } = await resend.contacts.create({ audienceId, email, unsubscribed: false })
    if (error) {
      console.error('[audience] add failed:', error.message)
      return null
    }
    return data?.id ?? null
  } catch (err) {
    console.error('[audience] add threw:', err)
    return null
  }
}

export async function removeFromAudience(email: string): Promise<void> {
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) return
  try {
    await resend.contacts.remove({ audienceId, email })
  } catch (err) {
    console.error('[audience] remove threw:', err)
  }
}
