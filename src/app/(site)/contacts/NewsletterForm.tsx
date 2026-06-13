'use client'

import { useState, type FormEvent } from 'react'
import { subscribeAction } from '@/lib/subscribers/actions'
import styles from './page.module.scss'

/**
 * Newsletter sign-up (double opt-in). Submits to subscribeAction, which emails a
 * confirmation link; we then show a "check your email" message. An already-active
 * address resolves the same way without a second email.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const result = await subscribeAction({ email, source: 'contacts' })
    setBusy(false)
    if (result.ok) setSubmitted(true)
    else setError(result.error)
  }

  return (
    <form className={styles.newsForm} onSubmit={handleSubmit} noValidate={false}>
      <label className={styles.newsLabel} htmlFor='newsletter-email'>
        Подписка на рассылку
      </label>

      {submitted ? (
        <p className={styles.newsOk}>
          Почти готово — <b>проверьте почту.</b> Мы отправили письмо для подтверждения подписки.
        </p>
      ) : (
        <>
          <div className={styles.newsRow}>
            <input
              id='newsletter-email'
              className={styles.newsInput}
              type='email'
              required
              placeholder='Ваш e-mail'
              autoComplete='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className={styles.newsButton} type='submit' disabled={busy}>
              {busy ? 'Отправка…' : 'Подписаться'}
            </button>
          </div>
          {error && <p className={styles.newsNote}>{error}</p>}
          <p className={styles.newsNote}>
            Нажимая «Подписаться», вы соглашаетесь с политикой обработки персональных
            данных. Отписаться можно в один клик.
          </p>
        </>
      )}
    </form>
  )
}
