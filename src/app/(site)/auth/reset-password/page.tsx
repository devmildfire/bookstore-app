'use client'

import { startTransition, useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updatePasswordAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import styles from '../login/page.module.scss'

const schema = z
  .object({
    password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
    confirmPassword: z.string().min(1, 'Повторите пароль'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })
type FormValues = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [state, serverAction, pending] = useActionState(updatePasswordAction, null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.set('password', data.password)
    // Dispatch inside a transition so useActionState's `pending` updates correctly.
    startTransition(() => serverAction(formData))
  }

  return (
    <div className={styles.page}>
      <h1>Новый пароль</h1>
      <p className={styles.hint}>Придумайте новый пароль и повторите его для подтверждения.</p>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Новый пароль
          <Input
            type='password'
            autoComplete='new-password'
            placeholder='Минимум 6 символов'
            {...register('password')}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <label className={styles.label}>
          Повторите новый пароль
          <Input
            type='password'
            autoComplete='new-password'
            placeholder='Ещё раз тот же пароль'
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className={styles.fieldError}>{errors.confirmPassword.message}</span>
          )}
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
          {pending ? 'Сохранение…' : 'Сохранить пароль'}
        </Button>
      </form>
    </div>
  )
}
