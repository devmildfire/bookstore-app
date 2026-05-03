import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createDataClient } from '@/lib/supabase/server'
import Providers from './providers'
import '@/styles/globals.scss'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: {
    default: 'Книжный магазин',
    template: '%s | Книжный магазин',
  },
  description: 'Онлайн магазин электронных книг',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang='ru'>
      <body>
        <Providers hasSession={!!user}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
