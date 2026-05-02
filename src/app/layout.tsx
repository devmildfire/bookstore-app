import type { Metadata } from 'next'
import '@/styles/globals.scss'

export const metadata: Metadata = {
  title: 'Книжный магазин',
  description: 'Онлайн магазин электронных книг',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='ru'>
      <body>{children}</body>
    </html>
  )
}
