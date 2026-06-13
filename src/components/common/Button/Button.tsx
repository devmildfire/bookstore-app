'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import Spinner from '@/components/common/Spinner'
import styles from './Button.module.scss'

// The one button for the whole app. `variant` covers both the compact general
// buttons (primary/secondary/ghost/danger × size sm/md/lg) and the large
// marketing CTAs (cta = solid red, ctaOutline = bordered) which carry their own
// Figma geometry and ignore `size`. Pass `href` to render a Next <Link> instead
// of a <button>; `fitContainer` stretches it full-width at the phone breakpoint.
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cta' | 'ctaOutline'
type Size = 'sm' | 'md' | 'lg'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fitContainer?: boolean
  /** Render as a Next <Link> (its href). Button-only props are ignored in this mode. */
  href?: string
}

const isCtaVariant = (v: Variant) => v === 'cta' || v === 'ctaOutline'

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading = false, fitContainer = false, href, disabled, children, className, ...props },
  ref
) {
  const classes = cn(
    styles.button,
    styles[variant],
    // CTA variants carry their own padding/typography; size applies to the rest.
    !isCtaVariant(variant) && styles[size],
    { [styles.fitContainer]: fitContainer, [styles.loading]: loading },
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Spinner size='sm' className={styles.buttonSpinner} />}
      {children}
    </button>
  )
})

export default Button
