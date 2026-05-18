type Props = { className?: string }

export default function ContextArrowIcon({ className }: Props) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Открыть в новой вкладке"
    >
      <circle cx="30" cy="30" r="29.25" />
      <path d="M11.5 30 H48.5" />
      <path d="M42.5 24 L48.5 30 L42.5 36" />
    </svg>
  )
}
