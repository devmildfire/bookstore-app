'use client'

import { Montserrat, Syncopate } from 'next/font/google'
import localFont from 'next/font/local'
import HalError from '@/components/common/HalError'
import '@/styles/globals.scss'
import css from './global-error.module.scss'

// global-error.tsx is the LAST-RESORT error boundary — it replaces the root
// layout entirely when the root layout itself throws. So it must render its own
// <html>/<body> shell, re-declare the fonts (so the phrase + nameplate typeset
// correctly), and import globals.scss. It is a Client Component by requirement.
//
// The font config mirrors src/app/layout.tsx exactly (same variables, same
// weights, same preload flags) so the error page looks like the rest of the site.

const montserrat = Montserrat({
  subsets: ['cyrillic', 'latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-montserrat',
  preload: false,
})

const cheque = localFont({
  src: './fonts/Chequeblack.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-cheque',
})

const syncopate = Syncopate({
  subsets: ['latin'],
  weight: ['700'],
  display: 'swap',
  variable: '--font-syncopate',
  preload: false,
})

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ reset }: Props) {
  return (
    <html lang='ru' className={`${montserrat.variable} ${cheque.variable} ${syncopate.variable}`}>
      <body className={css.body}>
        <HalError
          code='500'
          phrase='Мне жаль, Дейв, боюсь, я не могу этого сделать'
          onRetry={reset}
        />
      </body>
    </html>
  )
}
