'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductAction,
  addProductAction,
  removeProductAction,
  uploadProductFileAction,
  removeProductFileAction,
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
    <div className={styles.row}>
      <div className={styles.rowHead}>
        <span className={styles.label}>{edition.label}</span>
        <button type='button' className={styles.remove} onClick={handleRemove} disabled={removing}>
          {removing ? 'Удаление…' : 'Удалить'}
        </button>
      </div>

      <form action={action} className={styles.fields}>
        <input type='hidden' name='titleId' value={titleId} />
        <input type='hidden' name='editionId' value={edition.id} />
        <input type='hidden' name='table' value={edition.table} />
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
      </form>

      {edition.hasFile && <FileSlot titleId={titleId} edition={edition} />}
    </div>
  )
}

function FileSlot({ titleId, edition }: { titleId: number; edition: AdminEdition }) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const currentName = edition.filePath?.split('/').pop() ?? null

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      startTransition(async () => {
        const fd = new FormData()
        fd.set('titleId', String(titleId))
        fd.set('editionId', String(edition.id))
        fd.set('table', edition.table)
        fd.set('file', file)
        const res = await uploadProductFileAction(fd)
        if (res.status === 'error') setError(res.message)
        else router.refresh()
      })
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemoveFile() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('editionId', String(edition.id))
      fd.set('table', edition.table)
      fd.set('filePath', edition.filePath ?? '')
      const res = await removeProductFileAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.fileSlot}>
      <span className={styles.fileLabel}>Файл для скачивания:</span>
      {currentName ? <span className={styles.fileName}>{currentName}</span> : <span className={styles.fileNone}>нет</span>}
      <input ref={inputRef} type='file' onChange={handleUpload} className={styles.fileInput} disabled={busy} />
      <button type='button' className={styles.fileButton} onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? '…' : currentName ? 'Заменить' : 'Загрузить'}
      </button>
      {currentName && (
        <button type='button' className={styles.fileRemove} onClick={handleRemoveFile} disabled={busy}>
          Удалить файл
        </button>
      )}
      {error && <span className={styles.err}>{error}</span>}
    </div>
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
