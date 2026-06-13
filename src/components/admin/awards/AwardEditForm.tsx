'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateAwardAction, deleteAwardAction } from '@/lib/admin/awards/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import type { AdminAward } from '@/api/admin/awards'
import Input from '@/components/common/Input'
import styles from './AwardForm.module.scss'

export default function AwardEditForm({ award }: { award: AdminAward }) {
  const [state, action, pending] = useActionState(updateAwardAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    const warn =
      award.usageCount > 0
        ? `Награда «${award.title}» привязана к ${award.usageCount} кн. — связи тоже удалятся. Продолжить?`
        : `Удалить награду «${award.title}»? Это действие необратимо.`
    if (!confirm(warn)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(award.id))
      const res = await deleteAwardAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={award.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <Input name='title' defaultValue={award.title} required />
        </label>
        <label className={styles.label}>
          Slug
          <Input name='slug' defaultValue={award.slug} required />
        </label>
      </div>

      <div className={styles.grid}>
        <label className={styles.label}>
          Позиция
          <Input name='position' type='number' min={0} defaultValue={award.position} />
        </label>
        <div className={styles.checks}>
          <Checkbox name='isActive' defaultChecked={award.isActive} label='Активна' />
        </div>
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
          {deleting ? 'Удаление…' : 'Удалить награду'}
        </button>
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
