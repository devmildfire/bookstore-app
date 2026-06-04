'use client'

import { useActionState } from 'react'
import { createSubscriptionAction } from '@/lib/admin/subscriptions/actions'
import Button from '@/components/common/Button'
import styles from './SubscriptionCreateForm.module.scss'

export default function SubscriptionCreateForm() {
  const [state, action, pending] = useActionState(createSubscriptionAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Подписка создаётся неопубликованной. Преимущества и картинку задайте на следующем шаге.</p>
      <label className={styles.label}>
        Название
        <input name='name' className={styles.input} required placeholder='Например: Подписка на год' />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <input name='slug' className={styles.input} required placeholder='yearly' />
      </label>
      <label className={styles.label}>
        Цена ₽
        <input name='price' type='number' min={0} className={styles.input} required placeholder='5000' />
      </label>
      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Создание…' : 'Создать'}
        </Button>
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
