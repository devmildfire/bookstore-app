import ProfileMainPanel from '@/components/profile/ProfileMainPanel'

// Post-checkout flow redirects to /profile/orders now, so the
// AccountPostCheckoutModal that used to fire here was moved there.
export default function ProfilePage() {
  return <ProfileMainPanel />
}
