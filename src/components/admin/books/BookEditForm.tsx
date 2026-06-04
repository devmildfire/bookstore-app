'use client'

import { useActionState } from 'react'
import { updateBookAction } from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import type { AdminBook } from '@/api/admin/books'
import styles from './BookEditForm.module.scss'

type Props = { book: AdminBook }

export default function BookEditForm({ book }: Props) {
  const [state, action, pending] = useActionState(updateBookAction, null)

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={book.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <input name='name' defaultValue={book.name} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Slug
          <input name='slug' defaultValue={book.slug ?? ''} className={styles.input} required />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <textarea name='description' defaultValue={book.description ?? ''} className={styles.textarea} rows={5} />
      </label>

      <label className={styles.label}>
        Тезис
        <textarea name='thesis' defaultValue={book.thesis ?? ''} className={styles.textarea} rows={2} />
      </label>

      <div className={styles.grid}>
        <label className={styles.label}>
          Возрастное ограничение
          <input
            name='ageRestriction'
            type='number'
            min={0}
            max={21}
            defaultValue={book.ageRestriction ?? ''}
            className={styles.input}
          />
        </label>
        <label className={styles.label}>
          Год первого издания
          <input name='firstRelease' defaultValue={book.firstRelease ?? ''} className={styles.input} />
        </label>
        <label className={styles.label}>
          Литературная форма
          <input name='litForm' defaultValue={book.litForm ?? ''} className={styles.input} />
        </label>
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type='checkbox' name='isCompilation' defaultChecked={book.isCompilation} />
          Сборник
        </label>
      </div>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
