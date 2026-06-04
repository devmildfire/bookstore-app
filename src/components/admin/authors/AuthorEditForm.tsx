'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAuthorAction, deleteAuthorAction } from '@/lib/admin/authors/actions'
import Button from '@/components/common/Button'
import type { AdminAuthor } from '@/api/admin/authors'
import styles from './AuthorEditForm.module.scss'

export default function AuthorEditForm({ author }: { author: AdminAuthor }) {
  const [state, action, pending] = useActionState(updateAuthorAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить автора «${author.name}»? Это действие необратимо.`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(author.id))
      const res = await deleteAuthorAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={author.id} />

      <label className={styles.label}>
        Имя
        <input name='name' defaultValue={author.name} className={styles.input} required />
      </label>

      <label className={styles.label}>
        Биография
        <textarea name='bio' defaultValue={author.bio ?? ''} className={styles.textarea} rows={5} />
      </label>

      <div className={styles.grid}>
        <label className={styles.label}>
          Дата рождения
          <input name='birthDate' defaultValue={author.birthDate ?? ''} className={styles.input} placeholder='напр. 1965' />
        </label>
        <label className={styles.label}>
          Дата смерти
          <input name='deathDate' defaultValue={author.deathDate ?? ''} className={styles.input} />
        </label>
        <label className={styles.label}>
          Город
          <input name='city' defaultValue={author.city ?? ''} className={styles.input} />
        </label>
      </div>

      <label className={styles.label}>
        Фраза / цитата
        <input name='phrase' defaultValue={author.phrase ?? ''} className={styles.input} />
      </label>

      <label className={styles.check}>
        <input type='checkbox' name='nonsalable' defaultChecked={author.nonsalable} />
        Непродаваемый (служебный автор)
      </label>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>

      <div className={styles.danger}>
        <button type='button' className={styles.delete} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Удаление…' : 'Удалить автора'}
        </button>
        {author.titleCount > 0 && (
          <span className={styles.dangerNote}>Привязан к {author.titleCount} книгам — удалить нельзя.</span>
        )}
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
