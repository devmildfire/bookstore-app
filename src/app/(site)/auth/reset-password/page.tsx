'use client'

import { useActionState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updatePasswordAction } from '@/lib/auth/actions'
import Button from '@/components/common/Button'
import styles from '../login/page.module.scss'

const schema = z.object({
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
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
    serverAction(formData)
  }

  return (
    <div className={styles.page}>
      <h1>Новый пароль</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Новый пароль
          <input type='password' {...register('password')} className={styles.input} placeholder='Минимум 6 символов' />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} className={styles.submit}>
          {pending ? 'Сохранение...' : 'Сохранить пароль'}
        </Button>
      </form>
    </div>
  )
}
