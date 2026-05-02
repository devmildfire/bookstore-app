import type { ReactNode } from 'react'
import PageLayout from '@/components/layout/PageLayout'

type Props = {
  children: ReactNode
}

export default function BooksLayout({ children }: Props) {
  return <PageLayout>{children}</PageLayout>
}
