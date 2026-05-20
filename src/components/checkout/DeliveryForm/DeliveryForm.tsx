'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { shippingSchema, type ShippingFormValues } from '@/entities/order/validation'
import styles from './DeliveryForm.module.scss'

type Props = {
  onSubmit: (values: ShippingFormValues) => void
  isPending: boolean
}

export default function DeliveryForm({ onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      city: '',
      street: '',
      building: '',
      postalCode: '',
    },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.grid}>
        <div className={styles.field}>
          <label htmlFor='ship-name' className={styles.label}>
            Имя и фамилия <span className={styles.optional}>(необязательно)</span>
          </label>
          <input id='ship-name' className={styles.input} {...register('name')} disabled={isPending} />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='ship-city' className={styles.label}>Город/населённый пункт</label>
          <input id='ship-city' className={styles.input} {...register('city')} disabled={isPending} />
          {errors.city && <p className={styles.error}>{errors.city.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='ship-phone' className={styles.label}>
            Телефон <span className={styles.optional}>(необязательно)</span>
          </label>
          <input id='ship-phone' type='tel' className={styles.input} {...register('phone')} disabled={isPending} />
          {errors.phone && <p className={styles.error}>{errors.phone.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='ship-street' className={styles.label}>Улица</label>
          <input id='ship-street' className={styles.input} {...register('street')} disabled={isPending} />
          {errors.street && <p className={styles.error}>{errors.street.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='ship-email' className={styles.label}>
            E-mail <span className={styles.optional}>(необязательно)</span>
          </label>
          <input id='ship-email' type='email' className={styles.input} {...register('email')} disabled={isPending} />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        <div className={styles.fieldPair}>
          <div className={styles.field}>
            <label htmlFor='ship-building' className={styles.label}>Дом, квартира</label>
            <input id='ship-building' className={styles.input} {...register('building')} disabled={isPending} />
            {errors.building && <p className={styles.error}>{errors.building.message}</p>}
          </div>
          <div className={styles.field}>
            <label htmlFor='ship-postal' className={styles.label}>Почтовый индекс</label>
            <input id='ship-postal' inputMode='numeric' className={styles.input} {...register('postalCode')} disabled={isPending} />
            {errors.postalCode && <p className={styles.error}>{errors.postalCode.message}</p>}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type='submit' className={styles.submit} disabled={isPending}>
          Перейти к оплате
        </button>
        <p className={styles.caption}>
          После оплаты нажмите «Вернуться в магазин», чтобы скачать книгу.
        </p>
      </div>
    </form>
  )
}
