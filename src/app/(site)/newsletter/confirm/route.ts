import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { addToAudience } from '@/lib/email/audience'
import { getSiteOrigin } from '@/lib/siteUrl'

// Double opt-in confirmation link target. Activates the subscriber, mirrors them
// into the Resend Audience, then redirects to the /newsletter result page.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const result = (status: string) => NextResponse.redirect(new URL(`/newsletter?status=${status}`, getSiteOrigin()))

  if (!token) return result('invalid')

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('confirm_newsletter', { p_token: token })
  if (error) {
    console.error('[newsletter confirm] rpc failed:', error.message)
    return result('error')
  }
  const res = data as { status: string; email?: string }
  if (res.status !== 'ok' || !res.email) return result('invalid')

  // Best-effort Audience sync (no-op until RESEND_AUDIENCE_ID is set).
  const contactId = await addToAudience(res.email)
  if (contactId) {
    await admin.rpc('set_subscriber_resend_contact', {
      p_email: res.email,
      p_contact_id: contactId,
    })
  }

  return result('confirmed')
}
