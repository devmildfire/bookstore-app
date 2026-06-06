'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateBoxSetAction, deleteBoxSetAction } from '@/lib/admin/boxSets/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import type { AdminBoxSet } from '@/api/admin/boxSets'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
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
          <AdminInput name='name' defaultValue={boxSet.name} required />
        </label>
        <label className={styles.label}>
          Slug
          <AdminInput name='slug' defaultValue={boxSet.slug} required />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <AdminTextarea name='description' defaultValue={boxSet.description ?? ''} rows={4} />
      </label>

      <div className={styles.grid}>
        <label className={styles.label}>
          Цена ₽
          <AdminInput name='price' type='number' min={0} defaultValue={boxSet.price} />
        </label>
        <label className={styles.label}>
          Скидка %
          <AdminInput name='discount' type='number' min={0} max={100} defaultValue={boxSet.discount ?? ''} />
        </label>
      </div>

      <div className={styles.checks}>
        <Checkbox name='isPublished' defaultChecked={boxSet.isPublished} label='Опубликован' />
        <Checkbox name='isActive' defaultChecked={boxSet.isActive} label='Активен' />
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
