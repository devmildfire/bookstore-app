import type { ProductCategory } from '@/types/database'

type Props = {
  category: ProductCategory
  size?: number
  className?: string
}

export default function ProductTypeIcon({ category, size = 52, className }: Props) {
  const base = {
    width: size,
    height: size,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    'aria-hidden': true as const,
    className,
  }

  if (category === 'PrintBook') {
    // viewBox cropped to the icon area (content lives at cx=70,cy=70 inside 140×140 canvas)
    return (
      <svg {...base} viewBox="50 50 40 40">
        <circle cx="70" cy="70" r="19.5" />
        <path d="M59.3029 61.1104C60.4262 61.7359 61.9221 62.5701 63.426 63.4092C66.4348 65.0879 69.4619 66.7788 69.6213 66.8721V66.873L69.7482 66.9473L69.9953 67.0918L70.2453 66.9521L76.3976 63.5146C78.0894 62.5694 79.6331 61.7076 80.757 61.0811C81.2072 60.8301 81.5899 60.616 81.8879 60.4502C81.8895 60.5918 81.8944 60.7564 81.8957 60.9473C81.9028 61.9974 81.9055 63.8201 81.9055 66.9023V73.916L75.9728 77.3662C74.2733 78.3544 72.7238 79.2532 71.5969 79.9043C71.0334 80.2298 70.5757 80.4928 70.258 80.6748C70.1591 80.7315 70.0734 80.7793 70.0031 80.8193C69.9241 80.7742 69.8267 80.7186 69.7131 80.6533C69.3752 80.4592 68.8944 80.1812 68.3176 79.8477C67.1637 79.1805 65.6275 78.2901 64.09 77.3975C62.5525 76.5048 61.0133 75.6097 59.8537 74.9336C59.2739 74.5956 58.7887 74.3121 58.4465 74.1113C58.3151 74.0343 58.2055 73.9689 58.1193 73.918C58.1188 73.8992 58.1179 73.8789 58.1174 73.8574C58.1116 73.6262 58.1071 73.2578 58.1037 72.7061C58.0969 71.6034 58.0949 69.7812 58.0949 66.8887C58.0949 63.4247 58.0955 61.6055 58.1037 60.6553C58.1044 60.5792 58.1059 60.5091 58.1066 60.4443C58.4206 60.6188 58.8284 60.8461 59.3029 61.1104Z" />
      </svg>
    )
  }

  if (category === 'EBook') {
    return (
      <svg {...base} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="19.5" />
        {/* tablet frame */}
        <rect x="12" y="9" width="15.28" height="22" />
        {/* home-button bar */}
        <rect x="11.64" y="28.85" width="16.21" height="2.55" />
        {/* home-button dot */}
        <circle cx="19.75" cy="30.13" r="0.5" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (category === 'Book2.0') {
    return (
      <svg {...base} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="19.5" />
        {/* outer frame */}
        <rect x="11" y="8" width="17.28" height="24" />
        {/* 2×2 grid */}
        <rect x="14.38" y="14.26" width="3.8" height="3.8" />
        <rect x="21.1"  y="14.26" width="3.8" height="3.8" />
        <rect x="14.38" y="20.98" width="3.8" height="3.8" />
        <rect x="21.1"  y="20.98" width="3.8" height="3.8" />
      </svg>
    )
  }

  if (category === 'AudioBook') {
    return (
      <svg {...base} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="19.5" />
        <path d="M13.158 30.2827V9.21143L31.4051 19.7466L13.158 30.2827Z" />
      </svg>
    )
  }

  return null
}
