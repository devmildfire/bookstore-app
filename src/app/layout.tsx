import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import { createClient } from '@/lib/supabase/server'
import Providers from './providers'
import '@/styles/globals.scss'

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
})

const cheque = localFont({
  src: './fonts/Chequeblack.ttf',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-cheque',
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
    <html lang='ru' className={`${montserrat.variable} ${cheque.variable}`}>
      <body>
        {/* Storefront chrome (Header/Footer) lives in the (site) route group,
            not here — so /admin can render its own header-free layout. */}
        <Providers hasSession={!!user}>{children}</Providers>
      </body>
    </html>
  )
}
