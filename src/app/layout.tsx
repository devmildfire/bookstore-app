import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'
import Providers from './providers'
import '@/styles/globals.scss'
import Header from '@/components/layout/Header'

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
})

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
    <html lang='ru' className={montserrat.variable}>
      <body>
        <Providers hasSession={!!user}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
