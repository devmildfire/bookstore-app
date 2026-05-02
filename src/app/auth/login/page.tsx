'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  return (
    <div className={styles.page}>
      <h1>Вход</h1>

      {justRegistered && (
        <p className={styles.success}>Аккаунт создан. Теперь вы можете войти.</p>
      )}

      <form action={formAction} className={styles.form}>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Email
          <input type='email' name='email' required className={styles.input} placeholder='your@email.com' />
        </label>

        <label className={styles.label}>
          Пароль
          <input type='password' name='password' required className={styles.input} placeholder='••••••••' />
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
          {pending ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <p className={styles.link}>
        Нет аккаунта? <Link href='/auth/register'>Зарегистрироваться</Link>
      </p>
      <p className={styles.link}>
        <Link href='/books'>Продолжить как гость</Link>
      </p>
    </div>
  )
}
