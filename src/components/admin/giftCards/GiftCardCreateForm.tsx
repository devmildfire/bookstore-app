'use client'

import { useActionState } from 'react'
import { createGiftCardAction } from '@/lib/admin/giftCards/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from './GiftCardCreateForm.module.scss'

export default function GiftCardCreateForm() {
  const [state, action, pending] = useActionState(createGiftCardAction, null)
  return (
    <form action={action} className={styles.form}>
      <label className={styles.label}>
        Название
        <AdminInput name='name' required placeholder='Например: Карта даров 1000 ₽' />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <AdminInput name='slug' required placeholder='gift-1000' />
      </label>
      <label className={styles.label}>
        Номинал ₽
        <AdminInput name='faceValue' type='number' min={1} required placeholder='1000' />
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
