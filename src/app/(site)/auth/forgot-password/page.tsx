'use client'

import { startTransition, useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { requestPasswordResetAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from '../login/page.module.scss'

const schema = z.object({ email: z.string().email('Введите корректный email') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [state, serverAction, pending] = useActionState(requestPasswordResetAction, null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.set('email', data.email)
    startTransition(() => serverAction(formData))
  }

  return (
    <div className={styles.page}>
      <h1>Восстановление пароля</h1>

      {state?.ok ? (
        <p className={styles.success}>
          Если этот адрес зарегистрирован, мы отправили на него ссылку для сброса пароля.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {state?.error && <p className={styles.error}>{state.error}</p>}

          <label className={styles.label}>
            Email
            <AdminInput type='email' autoComplete='email' {...register('email')} placeholder='your@email.com' />
            {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
          </label>

          <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
            {pending ? 'Отправка...' : 'Отправить ссылку'}
          </Button>
        </form>
      )}

      <p className={styles.link}>
        <Link href='/auth/login'>Вернуться ко входу</Link>
      </p>
    </div>
  )
}
