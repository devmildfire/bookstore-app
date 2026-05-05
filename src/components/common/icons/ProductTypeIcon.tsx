import type { ProductCategory } from '@/types/database'

type Props = {
  category: ProductCategory
  size?: number
  className?: string
}

export default function ProductTypeIcon({ category, size = 32, className }: Props) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  if (category === 'PrintBook') {
    return (
      <svg {...props}>
        {/* envelope */}
        <rect x="4" y="8" width="24" height="18" rx="2" />
        <polyline points="4,8 16,18 28,8" />
      </svg>
    )
  }

  if (category === 'EBook') {
    return (
      <svg {...props}>
        {/* tablet */}
        <rect x="7" y="3" width="18" height="26" rx="2" />
        <line x1="14" y1="25" x2="18" y2="25" />
      </svg>
    )
  }

  if (category === 'Book2.0') {
    return (
      <svg {...props}>
        {/* open book */}
        <path d="M16 7 C16 7 10 5 4 7 L4 26 C10 24 16 26 16 26 C16 26 22 24 28 26 L28 7 C22 5 16 7 16 7Z" />
        <line x1="16" y1="7" x2="16" y2="26" />
      </svg>
    )
  }

  if (category === 'AudioBook') {
    return (
      <svg {...props}>
        {/* play button circle */}
        <circle cx="16" cy="16" r="12" />
        <polygon points="13,11 13,21 23,16" />
      </svg>
    )
  }

  return null
}
