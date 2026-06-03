import type { Metadata } from 'next'
import ComingSoon from '@/components/admin/ComingSoon'

export const metadata: Metadata = {
  title: 'Промокоды',
}

export default function AdminSectionPage() {
  return <ComingSoon title='Промокоды' />
}
