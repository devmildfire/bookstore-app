import type { AuthorContactChannel } from '@/entities/book/client'

// Line-art glyphs drawn inside a shared 24×24 viewBox so every icon's outer
// circle has the exact same diameter (r=11 from center 12,12). Strokes only,
// taking colour from `currentColor` so CSS controls hover state.
const GLYPHS: Record<AuthorContactChannel, React.ReactNode> = {
  vk: (
    <>
      <path d="M7 9 L9 15 L11 9" />
      <path d="M13 9 V15 M13 12 L16 9 M13 12 L16 15" />
    </>
  ),
  telegram: (
    <path d="M17.5 7.5 L6 13 L11 14.5 L13 17.2 L17.5 7.5 Z M11 14.5 L17.5 7.5" />
  ),
  instagram: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2.6" />
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="15" cy="9" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  facebook: (
    <>
      <path d="M12 17.5 V9.2 Q12 7.5 13.5 7.5 H14.5" />
      <path d="M10.3 11.5 H14" />
    </>
  ),
  twitter: <path d="M8 8 L16 16 M16 8 L8 16" />,
  email: (
    <>
      <rect x="6" y="8.5" width="12" height="8" rx="1" />
      <path d="M6.5 9 L12 13 L17.5 9" />
    </>
  ),
  website: (
    <>
      <circle cx="12" cy="12" r="5" />
      <path d="M7 12 H17" />
      <path d="M12 7 Q14.5 9.5 14.5 12 Q14.5 14.5 12 17 Q9.5 14.5 9.5 12 Q9.5 9.5 12 7" />
    </>
  ),
}

const CHANNEL_LABELS: Record<AuthorContactChannel, string> = {
  vk: 'ВКонтакте',
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  email: 'Электронная почта',
  website: 'Веб-страница',
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
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={CHANNEL_LABELS[channel]}
    >
      <circle cx="12" cy="12" r="11" />
      {GLYPHS[channel]}
    </svg>
  )
}
