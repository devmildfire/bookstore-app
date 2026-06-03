'use client'

import { useActionState } from 'react'
import { createBookAction } from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import styles from './BookCreateForm.module.scss'

export default function BookCreateForm() {
  const [state, action, pending] = useActionState(createBookAction, null)

  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>
        Книга создаётся как черновик и не видна на сайте, пока вы не добавите продукты и не опубликуете её.
      </p>

      <label className={styles.label}>
        Название
        <input name='name' className={styles.input} required placeholder='Например: Белый цветок' />
      </label>

      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <input name='slug' className={styles.input} required placeholder='white-flower' />
      </label>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Создание…' : 'Создать черновик'}
        </Button>
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
