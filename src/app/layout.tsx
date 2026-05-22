import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import { createClient } from '@/lib/supabase/server'
import Providers from './providers'
import '@/styles/globals.scss'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import styles from './layout.module.scss'

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
        <Providers hasSession={!!user}>
          <Header />
          <main className={styles.main}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
