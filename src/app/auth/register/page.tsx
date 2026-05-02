'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, null)

  return (
    <div className={styles.page}>
      <h1>Регистрация</h1>
      <form action={formAction} className={styles.form}>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Email
          <input type='email' name='email' required className={styles.input} placeholder='your@email.com' />
        </label>

        <label className={styles.label}>
          Пароль
          <input type='password' name='password' required className={styles.input} placeholder='Минимум 6 символов' minLength={6} />
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
          {pending ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <p className={styles.link}>
        Уже есть аккаунт? <Link href='/auth/login'>Войти</Link>
      </p>
      <p className={styles.link}>
        <Link href='/books'>Продолжить как гость</Link>
      </p>
    </div>
  )
}
