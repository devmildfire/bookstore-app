'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailOnlySchema, type EmailOnlyFormValues } from '@/entities/order/validation'
import styles from './EmailOnlyForm.module.scss'

type Props = {
  onSubmit: (values: EmailOnlyFormValues) => void
  isPending: boolean
  defaultEmail?: string | null
}

export default function EmailOnlyForm({ onSubmit, isPending, defaultEmail }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailOnlyFormValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: defaultEmail ?? '' },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor='checkout-email' className={styles.label}>
          E-mail <span className={styles.optional}>(необязательно)</span>
        </label>
        <input
          id='checkout-email'
          type='email'
          autoComplete='email'
          className={styles.input}
          {...register('email')}
          disabled={isPending}
        />
        {errors.email && <p className={styles.error}>{errors.email.message}</p>}
      </div>

      <p className={styles.hint}>
        Если оставите email — пришлём ссылки на скачивание и сохраним возможность
        вернуться к покупкам с любого устройства. Без email доступ работает только
        в этом браузере.
      </p>

      <div className={styles.actions}>
        <button type='submit' className={styles.submit} disabled={isPending}>
          Перейти к оплате
        </button>
        <p className={styles.caption}>
          После оплаты вы вернётесь в кабинет, чтобы скачать книги.
        </p>
      </div>
    </form>
  )
}
