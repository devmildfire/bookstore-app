'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateGiftCardAction, deleteGiftCardAction } from '@/lib/admin/giftCards/actions'
import Button from '@/components/common/Button'
import type { AdminGiftCard } from '@/api/admin/giftCards'
import styles from './GiftCardEditForm.module.scss'

export default function GiftCardEditForm({ giftCard }: { giftCard: AdminGiftCard }) {
  const [state, action, pending] = useActionState(updateGiftCardAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить карту даров «${giftCard.name}»?`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(giftCard.id))
      const res = await deleteGiftCardAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={giftCard.id} />
      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <input name='name' defaultValue={giftCard.name} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Slug
          <input name='slug' defaultValue={giftCard.slug} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Номинал ₽
          <input name='faceValue' type='number' min={1} defaultValue={giftCard.faceValue} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Порядок
          <input name='sortOrder' type='number' min={0} defaultValue={giftCard.sortOrder} className={styles.input} />
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
          {deleting ? 'Удаление…' : 'Удалить'}
        </button>
        {giftCard.issuedCount > 0 && (
          <span className={styles.dangerNote}>Выпущено {giftCard.issuedCount} карт — удалить нельзя.</span>
        )}
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
