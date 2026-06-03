'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductAction,
  addProductAction,
  removeProductAction,
} from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import { ALL_EDITION_TABLES, EDITION_LABEL, type AdminEdition, type EditionTable } from '@/lib/admin/bookProducts'
import styles from './ProductsManager.module.scss'

const HAS_SOLD_OUT = new Set<EditionTable>(['PrintedBooks', 'CardBooks'])

type Props = { titleId: number; editions: AdminEdition[] }

export default function ProductsManager({ titleId, editions }: Props) {
  const present = new Set(editions.map((e) => e.table))
  const absent = ALL_EDITION_TABLES.filter((t) => !present.has(t))

  return (
    <div className={styles.wrap}>
      {editions.length === 0 && <p className={styles.empty}>У книги пока нет продуктов. Добавьте хотя бы один.</p>}

      {editions.map((ed) => (
        <ProductRow key={`${ed.table}-${ed.id}`} titleId={titleId} edition={ed} />
      ))}

      {absent.length > 0 && (
        <div className={styles.add}>
          <span className={styles.addLabel}>Добавить продукт:</span>
          {absent.map((table) => (
            <AddButton key={table} titleId={titleId} table={table} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductRow({ titleId, edition }: { titleId: number; edition: AdminEdition }) {
  const [state, action, pending] = useActionState(updateProductAction, null)
  const [removing, startRemove] = useTransition()
  const [removeError, setRemoveError] = useState<string | null>(null)
  const router = useRouter()

  function handleRemove() {
    if (!confirm(`Удалить продукт «${edition.label}»? Это действие необратимо.`)) return
    setRemoveError(null)
    startRemove(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('editionId', String(edition.id))
      fd.set('table', edition.table)
      const res = await removeProductAction(fd)
      if (res.status === 'error') setRemoveError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.row}>
      <input type='hidden' name='titleId' value={titleId} />
      <input type='hidden' name='editionId' value={edition.id} />
      <input type='hidden' name='table' value={edition.table} />

      <div className={styles.rowHead}>
        <span className={styles.label}>{edition.label}</span>
        <button type='button' className={styles.remove} onClick={handleRemove} disabled={removing}>
          {removing ? 'Удаление…' : 'Удалить'}
        </button>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          Цена ₽
          <input name='price' type='number' step='0.01' defaultValue={edition.price ?? ''} className={styles.input} />
        </label>
        <label className={styles.field}>
          Скидка %
          <input name='discount' type='number' step='1' defaultValue={edition.discount ?? ''} className={styles.input} />
        </label>
        <label className={styles.check}>
          <input type='checkbox' name='isPublished' defaultChecked={edition.isPublished} />
          Опубликовано
        </label>
        {edition.hasSoldOut && (
          <label className={styles.check}>
            <input type='checkbox' name='soldOut' defaultChecked={edition.soldOut ?? false} />
            Распродано
          </label>
        )}
        <Button type='submit' variant='secondary' size='sm' loading={pending}>
          {pending ? '…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>✓</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
        {removeError && <span className={styles.err}>{removeError}</span>}
      </div>
    </form>
  )
}

function AddButton({ titleId, table }: { titleId: number; table: EditionTable }) {
  const [busy, startAdd] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleAdd() {
    setError(null)
    startAdd(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('table', table)
      const res = await addProductAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <span className={styles.addItem}>
      <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
        {busy ? '…' : `+ ${EDITION_LABEL[table]}`}
      </button>
      {error && <span className={styles.err}>{error}</span>}
    </span>
  )
}
