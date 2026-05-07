import type { ProductCategory } from '@/types/database'

type Props = {
  category: ProductCategory
  size?: number
  className?: string
}

export default function ProductTypeIcon({ category, size = 56, className }: Props) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 56 56',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
    className,
  }

  if (category === 'PrintBook') {
    return (
      <svg {...svgProps}>
        <circle cx="28" cy="28" r="26" />
        <rect x="14" y="19" width="28" height="20" rx="1" />
        <polyline points="14,19 28,30 42,19" />
      </svg>
    )
  }

  if (category === 'EBook') {
    return (
      <svg {...svgProps}>
        <circle cx="28" cy="28" r="26" />
        <rect x="18" y="14" width="20" height="28" rx="2" />
        <line x1="24" y1="38" x2="32" y2="38" />
      </svg>
    )
  }

  if (category === 'Book2.0') {
    return (
      <svg {...svgProps}>
        <circle cx="28" cy="28" r="26" />
        <rect x="17" y="17" width="9" height="9" />
        <rect x="30" y="17" width="9" height="9" />
        <rect x="17" y="30" width="9" height="9" />
        <rect x="30" y="30" width="9" height="9" />
      </svg>
    )
  }

  if (category === 'AudioBook') {
    return (
      <svg {...svgProps}>
        <circle cx="28" cy="28" r="26" />
        <polygon points="22,19 22,37 39,28" />
      </svg>
    )
  }

  return null
}
