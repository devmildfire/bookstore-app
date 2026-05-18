import type { AuthorContactChannel } from '@/entities/book/client'

const ICON_PATHS: Record<AuthorContactChannel, React.ReactNode> = {
  telegram: (
    <path d="M21.5 4.5 L2.5 12.2 c-.7.3-.6 1.3.1 1.5 l4.6 1.5 1.8 5.7 c.2.6 1 .8 1.5.3 l2.5-2.4 4.8 3.5 c.6.5 1.5.2 1.7-.6 L23 5.6 c.2-.8-.6-1.5-1.5-1.1 Z M9.7 14.7 l9.4-5.8 -7.7 7.2 z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </>
  ),
  facebook: (
    <path d="M13 22 V12 H16 L16.5 8 H13 V6 c0-1 .5-2 2-2 h1.5 V0 h-3 c-3 0-5 2-5 5 v3 H6 V12 h2.5 V22 z" />
  ),
  twitter: (
    <path d="M22 6 c-.7.3-1.5.6-2.3.7 .8-.5 1.5-1.3 1.8-2.3 -.8.5-1.7.8-2.6 1 -.8-.8-1.9-1.4-3.1-1.4 -2.4 0-4.3 2-4.3 4.3 0 .3 0 .7.1 1 -3.6-.2-6.8-1.9-8.9-4.5 -.4.6-.6 1.4-.6 2.2 0 1.5.8 2.8 1.9 3.6 -.7 0-1.4-.2-2-.5 v.1 c0 2.1 1.5 3.8 3.5 4.2 -.4.1-.7.2-1.1.2 -.3 0-.5 0-.8-.1 .6 1.7 2.2 3 4.1 3 -1.5 1.2-3.4 1.9-5.5 1.9 -.4 0-.7 0-1.1-.1 2 1.3 4.3 2 6.8 2 8.2 0 12.7-6.8 12.7-12.7 v-.6 c.9-.6 1.6-1.4 2.2-2.3 z" />
  ),
  email: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7 L12 13 L21 7" />
    </>
  ),
}

type Props = {
  channel: AuthorContactChannel
  size?: number
  className?: string
}

export default function AuthorContactIcon({ channel, size = 30, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[channel]}
    </svg>
  )
}
