'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAuthorAction, deleteAuthorAction } from '@/lib/admin/authors/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import type { AdminAuthor } from '@/api/admin/authors'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import AdminDatePicker from '@/components/admin/AdminDatePicker'
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
        <AdminInput name='name' defaultValue={author.name} required />
      </label>

      <label className={styles.label}>
        Биография
        <AdminTextarea name='bio' defaultValue={author.bio ?? ''} rows={5} />
      </label>

      <div className={styles.grid}>
        <div className={styles.label}>
          <span>Дата рождения</span>
          <AdminDatePicker name='birthDate' defaultValue={author.birthDate ?? ''} ariaLabel='Дата рождения' />
        </div>
        <div className={styles.label}>
          <span>Дата смерти</span>
          <AdminDatePicker name='deathDate' defaultValue={author.deathDate ?? ''} ariaLabel='Дата смерти' />
        </div>
        <label className={styles.label}>
          Город
          <AdminInput name='city' defaultValue={author.city ?? ''} />
        </label>
      </div>

      <label className={styles.label}>
        Фраза / цитата
        <AdminTextarea name='phrase' defaultValue={author.phrase ?? ''} rows={3} />
      </label>

      <Checkbox name='nonsalable' defaultChecked={author.nonsalable} label='Непродаваемый (служебный автор)' />

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
