import type { AuthorContactChannel } from '@/entities/book/client'

// Line-art glyphs that match the Figma "Об авторе" contact row.
// All paths are stroke-only (fill="none" on the wrapper) so the icons take
// their colour from `currentColor`, letting CSS handle hover styling.
const ICON_PATHS: Record<AuthorContactChannel, React.ReactNode> = {
  telegram: (
    <>
      <path d="M3 11.5 L21 4 L18 20 L11 15 L8 19 L8 14 L18 5" />
    </>
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M13.5 8 H12.6 A1.5 1.5 0 0 0 11.1 9.5 V12 H9 V14.5 H11.1 V20 M11.1 12 H13.5" />
    </>
  ),
  twitter: (
    <>
      <path d="M4 4 L11 13 L4 20 M20 4 L11 13 L20 20" />
      <path d="M4 4 L20 20" />
    </>
  ),
  email: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="1" />
      <path d="M3.5 7 L12 13 L20.5 7" />
    </>
  ),
}

const CHANNEL_LABELS: Record<AuthorContactChannel, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  email: 'Электронная почта',
}

type Props = {
  channel: AuthorContactChannel
  className?: string
}

export default function AuthorContactIcon({ channel, className }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={CHANNEL_LABELS[channel]}
    >
      {ICON_PATHS[channel]}
    </svg>
  )
}
