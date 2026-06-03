import type { Metadata } from 'next'
import ComingSoon from '@/components/admin/ComingSoon'

export const metadata: Metadata = {
  title: 'Карты даров',
}

export default function AdminSectionPage() {
  return <ComingSoon title='Карты даров' />
}
