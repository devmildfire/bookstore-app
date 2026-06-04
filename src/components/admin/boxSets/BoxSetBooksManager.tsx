'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addBoxSetBookAction, removeBoxSetBookAction } from '@/lib/admin/boxSets/actions'
import type { AdminBoxSetBook } from '@/api/admin/boxSets'
import styles from './BoxSetBooksManager.module.scss'

type Props = {
  boxSetId: number
  books: AdminBoxSetBook[]
  titleOptions: { id: number; name: string }[]
}

export default function BoxSetBooksManager({ boxSetId, books, titleOptions }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const titleRef = useRef<HTMLSelectElement>(null)
  const productRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleAdd() {
    const titleId = titleRef.current?.value
    if (!titleId) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('boxSetId', String(boxSetId))
      fd.set('titleId', titleId)
      if (productRef.current?.value.trim()) fd.set('productId', productRef.current.value.trim())
      const res = await addBoxSetBookAction(fd)
      if (res.status === 'error') setError(res.message)
      else {
        if (productRef.current) productRef.current.value = ''
        router.refresh()
      }
    })
  }

  function handleRemove(linkId: number) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('boxSetId', String(boxSetId))
      fd.set('linkId', String(linkId))
      const res = await removeBoxSetBookAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.wrap}>
      {books.length === 0 ? (
        <p className={styles.empty}>В бокс-сете пока нет книг.</p>
      ) : (
        <ul className={styles.list}>
          {books.map((b) => (
            <li key={b.linkId} className={styles.item}>
              <span className={styles.name}>{b.titleName}</span>
              {b.productId && <span className={styles.product}>{b.productId}</span>}
              <button type='button' onClick={() => handleRemove(b.linkId)} disabled={busy} aria-label='Убрать книгу'>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.add}>
        <select ref={titleRef} className={styles.select} defaultValue='' disabled={busy} aria-label='Книга'>
          <option value='' disabled>
            Выберите книгу…
          </option>
          {titleOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <input
          ref={productRef}
          className={styles.input}
          placeholder='product_id (необязательно, напр. PrintBook-5)'
          disabled={busy}
        />
        <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
          Добавить
        </button>
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
