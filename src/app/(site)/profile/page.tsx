import ProfileMainPanel from '@/components/profile/ProfileMainPanel'
import EmailConfirmedModal from '@/components/profile/EmailConfirmedModal'

// Post-checkout flow redirects to /profile/orders now, so the
// AccountPostCheckoutModal that used to fire here was moved there.
//
// `?email_confirmed=1` is set by /auth/confirm on a successful signup /
// email-change confirmation → show the one-time success modal.
export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ email_confirmed?: string }>
}) {
  const { email_confirmed } = await searchParams
  return (
    <>
      <ProfileMainPanel />
      {email_confirmed === '1' && <EmailConfirmedModal />}
    </>
  )
}
