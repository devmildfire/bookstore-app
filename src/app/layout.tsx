import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import localFont from 'next/font/local'
import Providers from './providers'
import '@/styles/globals.scss'

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  // Match the weights actually used in the styles: 400/600/700/900 (900 is the most-used
  // heading weight and was previously faux-bolded; 500 was declared but never used).
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
  // Do NOT preload Montserrat. Preloading emitted ~5 High-priority woff2 requests (~127 KB)
  // that competed with the LCP hero cover for Slow-4G bandwidth in its exact load window.
  // The hero's defining text is Chequeblack (preloaded below); Montserrat covers thesis/
  // button/below-the-fold text, which can swap in (display:swap) without delaying the LCP.
  preload: false,
})

const cheque = localFont({
  // woff2 (≈12 KB) instead of the 44 KB .ttf — it's a preloaded font, so this trims the
  // critical path directly. Generated from Chequeblack.ttf via ttf2woff2.
  src: './fonts/Chequeblack.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-cheque',
})

export const metadata: Metadata = {
  // Resolves relative OpenGraph/canonical/Twitter URLs to absolute ones. NEXT_PUBLIC_BASE_URL
  // is the prod origin (set in prod .env); falls back to localhost in dev.
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Книжный магазин',
    template: '%s | Книжный магазин',
  },
  description: 'Онлайн магазин электронных книг',
}

// Intentionally NOT async and reads no cookies/auth — keeping the root layout free
// of per-request reads is what lets storefront routes be statically prerendered / PPR.
// The client gates anonymous sign-in off the proxy-set `bookstore_has_session` hint
// cookie (see proxy.ts + providers.tsx), so the layout never needs getUser() here
// (which also removes the duplicate auth-server call the proxy already makes).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ru' className={`${montserrat.variable} ${cheque.variable}`}>
      <body>
        {/* Storefront chrome (Header/Footer) lives in the (site) route group,
            not here — so /admin can render its own header-free layout. */}
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
