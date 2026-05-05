type Props = {
  size?: number
  className?: string
}

export default function CartPlusIcon({ size = 24, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* bag body */}
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      {/* bag top crease */}
      <line x1="3" y1="6" x2="21" y2="6" />
      {/* handles */}
      <path d="M16 10a4 4 0 0 1-8 0" />
      {/* plus */}
      <line x1="12" y1="13" x2="12" y2="19" />
      <line x1="9" y1="16" x2="15" y2="16" />
    </svg>
  )
}
