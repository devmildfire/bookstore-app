'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updatePartnerAction, deletePartnerAction } from '@/lib/admin/partners/actions'
import Button from '@/components/common/Button'
import type { AdminPartner } from '@/api/admin/partners'
import AdminInput from '@/components/admin/AdminInput'
import styles from './PartnerForm.module.scss'

export default function PartnerEditForm({ partner }: { partner: AdminPartner }) {
  const [state, action, pending] = useActionState(updatePartnerAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить партнёра «${partner.name}»? Это действие необратимо.`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(partner.id))
      const res = await deletePartnerAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={partner.id} />

      <label className={styles.label}>
        Название
        <AdminInput name='name' defaultValue={partner.name} required />
      </label>

      <label className={styles.label}>
        Подпись под логотипом
        <AdminInput name='caption' defaultValue={partner.caption ?? ''} placeholder='Если логотип без текста, напр. ФАРЕНГЕЙТ 451' />
      </label>

      <label className={styles.label}>
        Ссылка на сайт
        <AdminInput name='websiteUrl' type='url' defaultValue={partner.websiteUrl ?? ''} placeholder='https://example.com' />
      </label>

      <label className={styles.label}>
        Позиция
        <AdminInput name='position' type='number' min={0} defaultValue={partner.position} />
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
          {deleting ? 'Удаление…' : 'Удалить партнёра'}
        </button>
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
