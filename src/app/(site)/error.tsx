'use client'

import HalError from '@/components/common/HalError'
import css from './error.module.scss'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

// Storefront error boundary — renders inside the (site) layout, so Header/Footer
// chrome is present. The root error.tsx (chromeless) handles /admin, /api, and
// other non-storefront errors; global-error.tsx fires when the root layout
// itself throws.
export default function StorefrontError({ reset }: Props) {
  return (
    <div className={css.error}>
      <HalError
        code='500'
        phrase='Мне жаль, Дейв, боюсь, я не могу этого сделать'
        onRetry={reset}
      />
    </div>
  )
}
