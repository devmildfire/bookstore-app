'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPromoCodeAction,
  updatePromoCodeAction,
  deletePromoCodeAction,
} from '@/lib/admin/promoCodes/actions'
import Button from '@/components/common/Button'
import AdminSelect from '@/components/admin/AdminSelect'
import type { AdminPromoCode } from '@/api/admin/promoCodes'
import AdminInput from '@/components/admin/AdminInput'
import styles from './PromoCodeForm.module.scss'

type Props = {
  mode: 'create' | 'edit'
  titleOptions: { id: number; name: string }[]
  promo?: AdminPromoCode
}

function toLocalInput(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function PromoCodeForm({ mode, titleOptions, promo }: Props) {
  const action = mode === 'create' ? createPromoCodeAction : updatePromoCodeAction
  const [state, formAction, pending] = useActionState(action, null)
  const [kind, setKind] = useState<'cart' | 'item'>(promo?.kind ?? 'cart')
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!promo) return
    if (!confirm(`Удалить промокод ${promo.code}?`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', promo.id)
      const res = await deletePromoCodeAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
    })
  }

  return (
    <form action={formAction} className={styles.form}>
      {promo && <input type='hidden' name='id' value={promo.id} />}

      <div className={styles.grid}>
        <label className={styles.label}>
          Код
          <AdminInput name='code' defaultValue={promo?.code ?? ''} required placeholder='SUMMER25' />
        </label>
        <label className={styles.label}>
          Скидка %
          <AdminInput
            name='discountPct'
            type='number'
            min={1}
            max={100}
            defaultValue={promo?.discountPct ?? ''}
            required
          />
        </label>
        <div className={styles.label}>
          <span>Тип</span>
          <AdminSelect
            name='kind'
            defaultValue={kind}
            ariaLabel='Тип'
            onChange={(v) => setKind(v as 'cart' | 'item')}
            options={[
              { value: 'cart', label: 'На всю корзину' },
              { value: 'item', label: 'На товар' },
            ]}
          />
        </div>
      </div>

      {kind === 'item' && (
        <div className={styles.grid}>
          <div className={styles.label}>
            <span>Книга (target_title_id)</span>
            <AdminSelect
              name='targetTitleId'
              defaultValue={promo?.targetTitleId ? String(promo.targetTitleId) : ''}
              ariaLabel='Книга'
              options={[
                { value: '', label: '—' },
                ...titleOptions.map((t) => ({ value: String(t.id), label: t.name })),
              ]}
            />
          </div>
          <label className={styles.label}>
            …или product_id
            <AdminInput
              name='targetProductId'
              defaultValue={promo?.targetProductId ?? ''}
              placeholder='напр. AudioBook-4'
            />
          </label>
        </div>
      )}

      <div className={styles.grid}>
        <label className={styles.label}>
          Начало действия
          <AdminInput name='startsAt' type='datetime-local' defaultValue={toLocalInput(promo?.startsAt)} required />
        </label>
        <label className={styles.label}>
          Окончание
          <AdminInput name='endsAt' type='datetime-local' defaultValue={toLocalInput(promo?.endsAt)} required />
        </label>
      </div>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : mode === 'create' ? 'Создать' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>

      {mode === 'edit' && promo && (
        <div className={styles.danger}>
          <button type='button' className={styles.delete} onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Удаление…' : 'Удалить промокод'}
          </button>
          {deleteError && <span className={styles.err}>{deleteError}</span>}
        </div>
      )}
    </form>
  )
}
