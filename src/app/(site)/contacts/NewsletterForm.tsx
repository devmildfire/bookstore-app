'use client'

import { useState, type FormEvent } from 'react'
import styles from './page.module.scss'

/**
 * Newsletter sign-up. The browser validates a well-formed address (the input is
 * `required type="email"`); on submit we swap the row + fine print for a success
 * message. The real subscription endpoint is out of scope — wire the mutation in
 * `handleSubmit` and flip `submitted` on resolve when it lands.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <form className={styles.newsForm} onSubmit={handleSubmit} noValidate={false}>
      <label className={styles.newsLabel} htmlFor='newsletter-email'>
        Подписка на рассылку
      </label>

      {submitted ? (
        <p className={styles.newsOk}>
          Готово — <b>добро пожаловать в стаю.</b> Первое письмо прилетит уже скоро.
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
            <button className={styles.newsButton} type='submit'>
              Подписаться
            </button>
          </div>
          <p className={styles.newsNote}>
            Нажимая «Подписаться», вы соглашаетесь с политикой обработки персональных
            данных. Отписаться можно в один клик.
          </p>
        </>
      )}
    </form>
  )
}
