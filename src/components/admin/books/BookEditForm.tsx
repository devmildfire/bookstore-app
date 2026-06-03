'use client'

import { useActionState } from 'react'
import { updateBookAction } from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import type { AdminBook } from '@/api/admin/books'
import styles from './BookEditForm.module.scss'

type Props = { book: AdminBook }

export default function BookEditForm({ book }: Props) {
  const [state, action, pending] = useActionState(updateBookAction, null)
  const editionKeys = JSON.stringify(book.editions.map((e) => ({ table: e.table, id: e.id })))

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={book.id} />
      <input type='hidden' name='editionKeys' value={editionKeys} />

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
          <input type='checkbox' name='isFeatured' defaultChecked={book.isFeatured} />
          Рекомендуемая (на главной)
        </label>
        <label className={styles.check}>
          <input type='checkbox' name='isCompilation' defaultChecked={book.isCompilation} />
          Сборник
        </label>
      </div>

      {book.editions.length > 0 && (
        <fieldset className={styles.editions}>
          <legend className={styles.legend}>Издания</legend>
          {book.editions.map((ed) => {
            const prefix = `ed_${ed.table}_${ed.id}_`
            return (
              <div key={`${ed.table}-${ed.id}`} className={styles.edition}>
                <span className={styles.editionLabel}>{ed.label}</span>
                <div className={styles.editionFields}>
                  <label className={styles.smallLabel}>
                    Цена ₽
                    <input
                      name={`${prefix}price`}
                      type='number'
                      step='0.01'
                      defaultValue={ed.price ?? ''}
                      className={styles.smallInput}
                    />
                  </label>
                  <label className={styles.smallLabel}>
                    Скидка %
                    <input
                      name={`${prefix}discount`}
                      type='number'
                      step='1'
                      defaultValue={ed.discount ?? ''}
                      className={styles.smallInput}
                    />
                  </label>
                  <label className={styles.check}>
                    <input type='checkbox' name={`${prefix}isPublished`} defaultChecked={ed.isPublished} />
                    Опубликовано
                  </label>
                  {ed.hasSoldOut && (
                    <label className={styles.check}>
                      <input type='checkbox' name={`${prefix}soldOut`} defaultChecked={ed.soldOut ?? false} />
                      Распродано
                    </label>
                  )}
                </div>
              </div>
            )
          })}
        </fieldset>
      )}

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
