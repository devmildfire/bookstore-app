import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.scss'

export const metadata: Metadata = {
  title: 'Рассылка',
  robots: { index: false },
}

const MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: { title: 'Подписка подтверждена', body: 'Спасибо, что вы с нами! Теперь вы будете получать новости «Чтива».' },
  unsubscribed: { title: 'Вы отписались', body: 'Больше мы не будем присылать вам письма. Вернуться можно в любой момент.' },
  invalid: { title: 'Ссылка недействительна', body: 'Ссылка устарела или уже была использована.' },
  error: { title: 'Что-то пошло не так', body: 'Попробуйте позже или напишите нам.' },
}

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const message = MESSAGES[status ?? ''] ?? MESSAGES.invalid

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{message.title}</h1>
      <p className={styles.body}>{message.body}</p>
      <Link href='/' className={styles.link}>На главную</Link>
    </div>
  )
}
