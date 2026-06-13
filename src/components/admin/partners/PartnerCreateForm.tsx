'use client'

import { useActionState } from 'react'
import { createPartnerAction } from '@/lib/admin/partners/actions'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import styles from './PartnerForm.module.scss'

export default function PartnerCreateForm() {
  const [state, action, pending] = useActionState(createPartnerAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Логотип и ссылку добавите на следующем шаге.</p>
      <label className={styles.label}>
        Название
        <Input name='name' required placeholder='Например: Подписные издания' />
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
