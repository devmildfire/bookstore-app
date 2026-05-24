'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/contexts/toast'
import styles from './DonateForm.module.scss'

const schema = z.object({
  amount: z
    .number({ invalid_type_error: 'Введите число' })
    .int('Сумма должна быть целым числом')
    .min(100, 'Минимальная сумма — 100 ₽'),
})

type FormValues = z.infer<typeof schema>

const DEFAULT_AMOUNT = 3000

export default function DonateForm() {
  const { success } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { amount: DEFAULT_AMOUNT },
  })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 300))
    success('Спасибо! Вы поддержали Чтиво.')
    reset({ amount: DEFAULT_AMOUNT })
  }

  return (
    <section className={styles.wrapper} aria-labelledby='donate-heading'>
      <h2 id='donate-heading' className={styles.heading}>
        Задонатить Чтиву
      </h2>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.inputWrap}>
          <input
            type='number'
            inputMode='numeric'
            min={100}
            step={100}
            className={styles.input}
            aria-label='Сумма пожертвования'
            aria-invalid={!!errors.amount}
            {...register('amount', { valueAsNumber: true })}
          />
          <span className={styles.suffix} aria-hidden='true'>
            ₽
          </span>
        </div>
        <button type='submit' className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Отправка…' : 'Поддержать'}
        </button>
        {errors.amount && <p className={styles.error}>{errors.amount.message}</p>}
      </form>
    </section>
  )
}
