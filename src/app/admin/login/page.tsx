'use client'

import { startTransition, useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { adminLoginAction } from '@/lib/admin/actions'
import Button from '@/components/common/Button'
import styles from './page.module.scss'

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormValues = z.infer<typeof schema>

export default function AdminLoginPage() {
  const [state, serverAction, pending] = useActionState(adminLoginAction, null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)
    // useActionState's dispatch must run inside a transition, or React warns
    // and `pending` won't update. RHF's handleSubmit calls this outside one.
    startTransition(() => {
      serverAction(formData)
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Админ-панель</h1>
        <p className={styles.subtitle}>Вход для сотрудников</p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
          {state?.error && <p className={styles.error}>{state.error}</p>}

          <label className={styles.label}>
            Email
            <input
              type='email'
              autoComplete='email'
              {...register('email')}
              className={styles.input}
              placeholder='admin@example.com'
            />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </label>

          <label className={styles.label}>
            Пароль
            <input
              type='password'
              autoComplete='current-password'
              {...register('password')}
              className={styles.input}
              placeholder='••••••••'
            />
            {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
          </label>

          <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
            {pending ? 'Вход…' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  )
}
