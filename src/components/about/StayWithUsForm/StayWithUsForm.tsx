'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/contexts/toast'
import OutlinedButton from '@/components/common/OutlinedButton'
import styles from './StayWithUsForm.module.scss'

const schema = z.object({
  email: z.string().trim().email('Введите корректный e-mail адрес'),
})

type FormValues = z.infer<typeof schema>

export default function StayWithUsForm() {
  const { success } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 300))
    success('Подписка оформлена')
    reset({ email: '' })
  }

  return (
    <section className={styles.wrapper} aria-labelledby='signup-heading'>
      <h2 id='signup-heading' className={styles.heading}>
        Будьте с нами
      </h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.row}>
          <div className={styles.inputWrap}>
            <input
              type='email'
              className={styles.input}
              placeholder='e-mail'
              aria-label='E-mail адрес'
              aria-invalid={!!errors.email}
              autoComplete='email'
              {...register('email')}
            />
          </div>
          <OutlinedButton type='submit' className={styles.submit} disabled={isSubmitting}>
            {isSubmitting ? 'Отправка…' : 'Подписаться'}
          </OutlinedButton>
        </div>
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </form>
    </section>
  )
}
