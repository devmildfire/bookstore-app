'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  createPromoCodeAction,
  updatePromoCodeAction,
  deletePromoCodeAction,
} from '@/lib/admin/promoCodes/actions'
import Button from '@/components/common/Button'
import type { AdminPromoCode } from '@/api/admin/promoCodes'
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
          <input name='code' defaultValue={promo?.code ?? ''} className={styles.input} required placeholder='SUMMER25' />
        </label>
        <label className={styles.label}>
          Скидка %
          <input
            name='discountPct'
            type='number'
            min={1}
            max={100}
            defaultValue={promo?.discountPct ?? ''}
            className={styles.input}
            required
          />
        </label>
        <label className={styles.label}>
          Тип
          <select
            name='kind'
            value={kind}
            onChange={(e) => setKind(e.target.value as 'cart' | 'item')}
            className={styles.input}
          >
            <option value='cart'>На всю корзину</option>
            <option value='item'>На товар</option>
          </select>
        </label>
      </div>

      {kind === 'item' && (
        <div className={styles.grid}>
          <label className={styles.label}>
            Книга (target_title_id)
            <select name='targetTitleId' defaultValue={promo?.targetTitleId ?? ''} className={styles.input}>
              <option value=''>—</option>
              {titleOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            …или product_id
            <input
              name='targetProductId'
              defaultValue={promo?.targetProductId ?? ''}
              className={styles.input}
              placeholder='напр. AudioBook-4'
            />
          </label>
        </div>
      )}

      <div className={styles.grid}>
        <label className={styles.label}>
          Начало действия
          <input name='startsAt' type='datetime-local' defaultValue={toLocalInput(promo?.startsAt)} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Окончание
          <input name='endsAt' type='datetime-local' defaultValue={toLocalInput(promo?.endsAt)} className={styles.input} required />
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
