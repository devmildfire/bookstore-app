import Link from 'next/link'
import cn from 'classnames'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './PrimaryButton.module.scss'

type CommonProps = {
  children: ReactNode
  className?: string
  // When true, at the phone breakpoint the button stretches to fill its
  // parent's width and tightens its horizontal padding so long labels
  // don't overflow narrow containers. Mirrors OutlinedButton.
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

// Shared solid red button: filled $color-accent-on-dark with a darker
// $color-accent-hover-on-dark on hover (the Figma "Кнопка 1920/hover"
// state). This is the standard primary CTA — counterpart to the
// transparent OutlinedButton, with the same padding/radius/typography.
export default function PrimaryButton(props: Props) {
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

  const { children, className, fitContainer, type, ...rest } = props as ButtonVariantProps
  return (
    <button
      {...rest}
      type={type ?? 'button'}
      className={cn(styles.button, fitContainer && styles.fitContainer, className)}
    >
      {children}
    </button>
  )
}
