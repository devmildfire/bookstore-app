'use client'

import HalError from '@/components/common/HalError'
import '@/styles/globals.scss'
import css from './global-error.module.scss'

// global-error.tsx is the LAST-RESORT error boundary — it replaces the root
// layout entirely when the root layout itself throws, so it renders its own
// <html>/<body> shell and imports globals.scss. It is a Client Component by
// requirement.
//
// It deliberately does NOT declare next/font: `next/font` is disallowed in a
// 'use client' module (Turbopack enforces this; webpack didn't). No loss here —
// HalError typography is the system sans-serif by design (see HalError.module.scss).

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ reset }: Props) {
  return (
    <html lang='ru'>
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
