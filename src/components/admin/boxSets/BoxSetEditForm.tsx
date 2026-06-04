'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBoxSetAction, deleteBoxSetAction } from '@/lib/admin/boxSets/actions'
import Button from '@/components/common/Button'
import type { AdminBoxSet } from '@/api/admin/boxSets'
import styles from './BoxSetEditForm.module.scss'

export default function BoxSetEditForm({ boxSet }: { boxSet: AdminBoxSet }) {
  const [state, action, pending] = useActionState(updateBoxSetAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить бокс-сет «${boxSet.name}»? Это действие необратимо.`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(boxSet.id))
      const res = await deleteBoxSetAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={boxSet.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <input name='name' defaultValue={boxSet.name} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Slug
          <input name='slug' defaultValue={boxSet.slug} className={styles.input} required />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <textarea name='description' defaultValue={boxSet.description ?? ''} className={styles.textarea} rows={4} />
      </label>

      <div className={styles.grid}>
        <label className={styles.label}>
          Цена ₽
          <input name='price' type='number' min={0} defaultValue={boxSet.price} className={styles.input} />
        </label>
        <label className={styles.label}>
          Скидка %
          <input name='discount' type='number' min={0} max={100} defaultValue={boxSet.discount ?? ''} className={styles.input} />
        </label>
      </div>

      <div className={styles.checks}>
        <label className={styles.check}>
          <input type='checkbox' name='isPublished' defaultChecked={boxSet.isPublished} />
          Опубликован
        </label>
        <label className={styles.check}>
          <input type='checkbox' name='isActive' defaultChecked={boxSet.isActive} />
          Активен
        </label>
      </div>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>

      <div className={styles.danger}>
        <button type='button' className={styles.delete} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Удаление…' : 'Удалить бокс-сет'}
        </button>
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
