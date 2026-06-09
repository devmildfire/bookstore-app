'use client'

import { useActionState } from 'react'
import { createAwardAction } from '@/lib/admin/awards/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from './AwardForm.module.scss'

export default function AwardCreateForm() {
  const [state, action, pending] = useActionState(createAwardAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Бейдж награды загрузите на следующем шаге.</p>
      <label className={styles.label}>
        Название
        <AdminInput name='title' required placeholder='Например: Книга года 2026' />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <AdminInput name='slug' required placeholder='book-of-the-year-2026' />
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
