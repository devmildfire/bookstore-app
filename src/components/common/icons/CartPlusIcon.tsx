type Props = {
  size?: number
  className?: string
}

export default function CartPlusIcon({ size = 22, className }: Props) {
  return (
    <svg
      width={size}
      height={Math.round(size * 18 / 16)}
      viewBox="0 0 16 18"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* bag shape — same as header shop-cart.svg */}
      <path d="M4.25 4.625C4.25 4.625 4.25 0.875 8 0.875C11.75 0.875 11.75 4.625 11.75 4.625M1.125 4.625V17.125H14.875V4.625H1.125Z" />
      {/* plus sign centered in bag body */}
      <line x1="8" y1="9.5" x2="8" y2="13.5" strokeLinecap="round" />
      <line x1="6" y1="11.5" x2="10" y2="11.5" strokeLinecap="round" />
    </svg>
  )
}
