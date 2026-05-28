import Link from 'next/link'
import cn from 'classnames'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './OutlinedButton.module.scss'

type CommonProps = {
  children: ReactNode
  className?: string
  // When true, at the phone breakpoint the button stretches to fill its
  // parent's width and tightens its horizontal padding so long labels
  // don't overflow narrow containers (e.g. the journal card on mobile).
  fitContainer?: boolean
}

type LinkVariantProps = CommonProps & {
  as?: 'link'
  href: string
}

type ButtonVariantProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
    as?: 'button'
    href?: never
  }

type Props = LinkVariantProps | ButtonVariantProps

// Shared bordered transparent button: 1px solid border + Montserrat label,
// no background fill. Hover swaps border + text colour to the accent red.
export default function OutlinedButton(props: Props) {
  if ('href' in props && props.href) {
    const { href, children, className, fitContainer } = props
    return (
      <Link
        href={href}
        className={cn(styles.button, fitContainer && styles.fitContainer, className)}
      >
        {children}
      </Link>
    )
  }

  const { children, className, fitContainer, ...rest } = props as ButtonVariantProps
  return (
    <button
      {...rest}
      className={cn(styles.button, fitContainer && styles.fitContainer, className)}
    >
      {children}
    </button>
  )
}
