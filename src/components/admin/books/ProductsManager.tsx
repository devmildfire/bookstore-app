'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  updateProductAction,
  addProductAction,
  removeProductAction,
  uploadProductFileAction,
  removeProductFileAction,
  uploadDemoFileAction,
  removeDemoFileAction,
  addWorkerAction,
  removeWorkerAction,
} from '@/lib/admin/books/actions'
import Button from '@/components/common/Button'
import Checkbox from '@/components/common/Checkbox'
import NumberStepper from '@/components/common/NumberStepper'
import Input from '@/components/common/Input'
import Badge from '@/components/common/Badge'
import { PaperIcon, DigitalIcon, AudioIcon, PlusIcon, TrashIcon, UploadIcon, CheckIcon } from '@/components/common/icons'
import { ALL_EDITION_TABLES, EDITION_LABEL, type AdminEdition, type EditionTable } from '@/lib/admin/bookProducts'
import styles from './ProductsManager.module.scss'

const HAS_SOLD_OUT = new Set<EditionTable>(['PrintedBooks', 'CardBooks'])

const EDITION_ICON: Record<EditionTable, React.FC<React.SVGProps<SVGSVGElement>>> = {
  PrintedBooks: PaperIcon,
  CardBooks: PaperIcon,
  Ebooks: DigitalIcon,
  Audiobooks: AudioIcon,
}

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

  const Icon = EDITION_ICON[edition.table]

  return (
    <div className={styles.product}>
      <div className={styles.productHead}>
        <Icon className={styles.productIcon} />
        <span className={styles.label}>{edition.label}</span>
        <Badge tone={edition.isPublished ? 'positive' : 'neutral'}>
          {edition.isPublished ? 'В продаже' : 'Скрыт'}
        </Badge>
        <span className={styles.spacer} />
        <button type='button' className={styles.remove} onClick={handleRemove} disabled={removing} aria-label='Удалить продукт'>
          <TrashIcon />
        </button>
      </div>

      <div className={styles.productBody}>
        <form action={action} className={styles.fields}>
          <input type='hidden' name='titleId' value={titleId} />
          <input type='hidden' name='editionId' value={edition.id} />
          <input type='hidden' name='table' value={edition.table} />
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Цена</span>
            <div className={styles.affix}>
              <Input name='price' type='number' step='0.01' defaultValue={edition.price ?? ''} className={styles.affixInput} />
              <span className={styles.affixUnit}>₽</span>
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Скидка %</span>
            <NumberStepper name='discount' defaultValue={edition.discount ?? ''} min={0} max={100} />
          </div>
          <div className={styles.checks}>
            <Checkbox name='isPublished' defaultChecked={edition.isPublished} label='Опубликовано' />
            {edition.hasSoldOut && <Checkbox name='soldOut' defaultChecked={edition.soldOut ?? false} label='Распродано' />}
          </div>
          <div className={styles.actions}>
            <Button type='submit' variant='secondary' size='md' className={styles.save} loading={pending}>
              {pending ? '…' : 'Сохранить'}
            </Button>
            {state?.status === 'ok' && (
              <span className={styles.ok}>
                <CheckIcon /> Сохранено
              </span>
            )}
            {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
            {removeError && <span className={styles.err}>{removeError}</span>}
          </div>
        </form>

        {edition.hasFile && <FileSlot titleId={titleId} edition={edition} />}

        {edition.hasDemo && <DemoSlot titleId={titleId} edition={edition} />}

        <WorkersSlot titleId={titleId} edition={edition} />
      </div>
    </div>
  )
}

function WorkersSlot({ titleId, edition }: { titleId: number; edition: AdminEdition }) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const jobRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleAdd() {
    const name = nameRef.current?.value.trim()
    const job = jobRef.current?.value.trim()
    if (!name || !job) {
      setError('Введите имя и роль.')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('editionId', String(edition.id))
      fd.set('table', edition.table)
      fd.set('name', name)
      fd.set('job', job)
      const res = await addWorkerAction(fd)
      if (res.status === 'error') setError(res.message)
      else {
        if (nameRef.current) nameRef.current.value = ''
        if (jobRef.current) jobRef.current.value = ''
        router.refresh()
      }
    })
  }

  function handleRemove(linkId: number, workerId: number) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('table', edition.table)
      fd.set('linkId', String(linkId))
      fd.set('workerId', String(workerId))
      const res = await removeWorkerAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.workers}>
      <span className={styles.workersLabel}>Над изданием работали:</span>
      {edition.workers.length === 0 ? (
        <span className={styles.fileNone}>пока никто</span>
      ) : (
        <ul className={styles.workerList}>
          {edition.workers.map((w) => (
            <li key={w.linkId} className={styles.workerItem}>
              <span>
                {w.name} — <span className={styles.workerJob}>{w.job}</span>
              </span>
              <button
                type='button'
                onClick={() => handleRemove(w.linkId, w.workerId)}
                disabled={busy}
                aria-label={`Убрать ${w.name}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.workerAdd}>
        <Input ref={nameRef} className={styles.workerField} placeholder='Имя' disabled={busy} />
        <Input ref={jobRef} className={styles.workerField} placeholder='Роль (напр. Переводчик)' disabled={busy} />
        <button type='button' className={styles.fileButton} onClick={handleAdd} disabled={busy}>
          + Добавить
        </button>
      </div>
      {error && <span className={styles.err}>{error}</span>}
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

function DemoSlot({ titleId, edition }: { titleId: number; edition: AdminEdition }) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const currentName = edition.demoPath?.split('/').pop() ?? null

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
        const res = await uploadDemoFileAction(fd)
        if (res.status === 'error') setError(res.message)
        else router.refresh()
      })
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('editionId', String(edition.id))
      fd.set('table', edition.table)
      fd.set('demoPath', edition.demoPath ?? '')
      const res = await removeDemoFileAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.fileSlot}>
      <span className={styles.fileLabel}>Демо-файл:</span>
      {currentName ? <span className={styles.fileName}>{currentName}</span> : <span className={styles.fileNone}>нет</span>}
      <input ref={inputRef} type='file' onChange={handleUpload} className={styles.fileInput} disabled={busy} />
      <button type='button' className={styles.fileButton} onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? '…' : currentName ? 'Заменить' : 'Загрузить'}
      </button>
      {currentName && (
        <button type='button' className={styles.fileRemove} onClick={handleRemove} disabled={busy}>
          Удалить демо
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
