'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePeriodicalAction, deletePeriodicalAction } from '@/lib/admin/periodicals/actions'
import Button from '@/components/common/Button'
import type { AdminPeriodical } from '@/api/admin/periodicals'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import styles from './PeriodicalForm.module.scss'

export default function PeriodicalEditForm({ periodical }: { periodical: AdminPeriodical }) {
  const [state, action, pending] = useActionState(updatePeriodicalAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    const warn =
      periodical.issues.length > 0
        ? `Удалить серию «${periodical.name}»? ${periodical.issues.length} выпуск(ов) останутся книгами, но отвяжутся от серии.`
        : `Удалить серию «${periodical.name}»? Это действие необратимо.`
    if (!confirm(warn)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(periodical.id))
      const res = await deletePeriodicalAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={periodical.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <AdminInput name='name' defaultValue={periodical.name} required />
        </label>
        <label className={styles.label}>
          Slug
          <AdminInput name='slug' defaultValue={periodical.slug ?? ''} required />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <AdminTextarea name='description' defaultValue={periodical.description ?? ''} rows={3} />
      </label>

      <label className={styles.label}>
        Позиция
        <AdminInput name='position' type='number' min={0} defaultValue={periodical.position} />
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
          {deleting ? 'Удаление…' : 'Удалить серию'}
        </button>
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
