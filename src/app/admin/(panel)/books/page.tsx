import type { Metadata } from 'next'
import ComingSoon from '@/components/admin/ComingSoon'

export const metadata: Metadata = {
  title: 'Книги',
}

export default function AdminSectionPage() {
  return <ComingSoon title='Книги' />
}
