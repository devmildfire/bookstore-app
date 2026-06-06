'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addAwardAction, removeAwardAction } from '@/lib/admin/books/actions'
import AdminSelect from '@/components/admin/AdminSelect'
import type { AdminAward } from '@/lib/admin/bookProducts'
import styles from './AwardsManager.module.scss'

type Props = { titleId: number; attached: AdminAward[]; catalog: AdminAward[] }

export default function AwardsManager({ titleId, attached, catalog }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState('')
  const router = useRouter()

  const attachedIds = new Set(attached.map((a) => a.id))
  const available = catalog.filter((a) => !attachedIds.has(a.id))

  function run(fd: FormData, action: (f: FormData) => Promise<{ status: string; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const res = await action(fd)
      if (res.status === 'error') setError(res.message ?? 'Ошибка')
      else router.refresh()
    })
  }

  function handleAdd() {
    if (!selected) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('awardId', selected)
      const res = await addAwardAction(fd)
      if (res.status === 'error') setError(res.message ?? 'Ошибка')
      else {
        setSelected('')
        router.refresh()
      }
    })
  }

  function handleRemove(awardId: number) {
    const fd = new FormData()
    fd.set('titleId', String(titleId))
    fd.set('awardId', String(awardId))
    run(fd, removeAwardAction)
  }

  return (
    <div className={styles.wrap}>
      {attached.length === 0 ? (
        <p className={styles.empty}>Награды не добавлены.</p>
      ) : (
        <ul className={styles.chips}>
          {attached.map((a) => (
            <li key={a.id} className={styles.chip}>
              <span>{a.title}</span>
              <button type='button' onClick={() => handleRemove(a.id)} disabled={busy} aria-label={`Убрать ${a.title}`}>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <div className={styles.add}>
          <AdminSelect
            key={attached.length}
            name='award'
            defaultValue=''
            ariaLabel='Награда'
            onChange={setSelected}
            options={[
              { value: '', label: 'Выберите награду…' },
              ...available.map((a) => ({ value: String(a.id), label: a.title })),
            ]}
          />
          <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
            Добавить
          </button>
        </div>
      )}
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
