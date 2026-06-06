'use client'

import { useActionState } from 'react'
import { createAuthorAction } from '@/lib/admin/authors/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from './AuthorCreateForm.module.scss'

export default function AuthorCreateForm() {
  const [state, action, pending] = useActionState(createAuthorAction, null)
  return (
    <form action={action} className={styles.form}>
      <label className={styles.label}>
        Имя автора
        <AdminInput name='name' required placeholder='Например: Фёдор Достоевский' />
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
