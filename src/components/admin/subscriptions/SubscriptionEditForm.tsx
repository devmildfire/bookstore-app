'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateSubscriptionAction, deleteSubscriptionAction } from '@/lib/admin/subscriptions/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import type { AdminSubscription } from '@/api/admin/subscriptions'
import AdminInput from '@/components/admin/AdminInput'
import AdminTextarea from '@/components/admin/AdminTextarea'
import styles from './SubscriptionEditForm.module.scss'

export default function SubscriptionEditForm({ subscription }: { subscription: AdminSubscription }) {
  const [state, action, pending] = useActionState(updateSubscriptionAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить подписку «${subscription.name}»?`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(subscription.id))
      const res = await deleteSubscriptionAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={subscription.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Название
          <AdminInput name='name' defaultValue={subscription.name} required />
        </label>
        <label className={styles.label}>
          Slug
          <AdminInput name='slug' defaultValue={subscription.slug} required />
        </label>
        <label className={styles.label}>
          Цена ₽
          <AdminInput name='price' type='number' min={0} defaultValue={subscription.price} />
        </label>
        <label className={styles.label}>
          Скидка %
          <AdminInput name='discount' type='number' min={0} max={100} defaultValue={subscription.discount ?? ''} />
        </label>
      </div>

      <label className={styles.label}>
        Описание
        <AdminTextarea name='description' defaultValue={subscription.description ?? ''} rows={3} />
      </label>

      <label className={styles.label}>
        Преимущества (по одному в строке)
        <AdminTextarea name='perks' defaultValue={subscription.perks.join('\n')} rows={5} />
      </label>

      <div className={styles.checks}>
        <Checkbox name='isPublished' defaultChecked={subscription.isPublished} label='Опубликована' />
        <Checkbox name='isActive' defaultChecked={subscription.isActive} label='Активна' />
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
          {deleting ? 'Удаление…' : 'Удалить подписку'}
        </button>
        {subscription.subscriberCount > 0 && (
          <span className={styles.dangerNote}>{subscription.subscriberCount} подписчиков — удалить нельзя.</span>
        )}
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
