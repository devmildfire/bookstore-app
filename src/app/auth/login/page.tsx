'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const [state, serverAction, pending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'
  const returnTo = searchParams.get('returnTo')
  const guestHref = returnTo && returnTo.startsWith('/') ? returnTo : '/books'

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)
    serverAction(formData)
  }

  return (
    <div className={styles.page}>
      <h1>Вход</h1>

      {justRegistered && (
        <p className={styles.success}>Аккаунт создан. Теперь вы можете войти.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Email
          <input type='email' {...register('email')} className={styles.input} placeholder='your@email.com' />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </label>

        <label className={styles.label}>
          Пароль
          <input type='password' {...register('password')} className={styles.input} placeholder='••••••••' />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
          {pending ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <p className={styles.link}>
        Нет аккаунта? <Link href='/auth/register'>Зарегистрироваться</Link>
      </p>
      <p className={styles.link}>
        <Link href={guestHref}>Продолжить как гость</Link>
      </p>
    </div>
  )
}
