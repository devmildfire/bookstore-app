'use client'

import { useActionState } from 'react'
import { createBoxSetAction } from '@/lib/admin/boxSets/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from './BoxSetCreateForm.module.scss'

export default function BoxSetCreateForm() {
  const [state, action, pending] = useActionState(createBoxSetAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Бокс-сет создаётся неопубликованным. Состав и цену задайте на следующем шаге.</p>
      <label className={styles.label}>
        Название
        <AdminInput name='name' required placeholder='Например: Подарочный набор' />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <AdminInput name='slug' required placeholder='gift-set' />
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
