'use client'

import HalError from '@/components/common/HalError'
import css from './error.module.scss'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

// Root error boundary — chromeless (no Header/Footer). Catches unhandled errors
// in routes outside the (site) group (e.g. /admin) where the root layout is
// still intact (unlike global-error.tsx, which fires when the root layout itself
// throws). The storefront group has its own (site)/error.tsx with chrome.
export default function RootError({ reset }: Props) {
  return (
    <div className={css.wrap}>
      <HalError
        code='500'
        phrase='Мне жаль, Дейв, боюсь, я не могу этого сделать'
        onRetry={reset}
      />
    </div>
  )
}
