'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { registerAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
})
type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const [state, serverAction, pending] = useActionState(registerAction, null)

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
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Email
          <input type='email' {...register('email')} className={styles.input} placeholder='your@email.com' />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </label>

        <label className={styles.label}>
          Пароль
          <input type='password' {...register('password')} className={styles.input} placeholder='Минимум 6 символов' />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
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
