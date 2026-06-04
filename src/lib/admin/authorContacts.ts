// Client-safe author types/constants (no server imports).
export const AUTHOR_CONTACT_CHANNELS = [
  'telegram',
  'instagram',
  'facebook',
  'twitter',
  'email',
  'website',
] as const
export type AuthorContactChannel = (typeof AUTHOR_CONTACT_CHANNELS)[number]

export const CONTACT_CHANNEL_LABEL: Record<AuthorContactChannel, string> = {
  telegram: 'Telegram',
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  email: 'Email',
  website: 'Сайт',
}

export type AdminAuthorContact = { id: number; channel: AuthorContactChannel; url: string }
