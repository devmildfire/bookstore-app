'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadBookPhotoAction, deleteBookPhotoAction } from '@/lib/admin/books/actions'
import type { AdminBookPhoto } from '@/api/admin/books'
import styles from './BookPhotosManager.module.scss'

type Props = {
  titleId: number
  hasSlug: boolean
  initialPhotos: AdminBookPhoto[]
}

export default function BookPhotosManager({ titleId, hasSlug, initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!hasSlug) {
    return <p className={styles.note}>Сначала задайте slug книги и сохраните — фото хранятся в папке по slug.</p>
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setBusy(true)
      setError(null)
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('file', file)
      const res = await uploadBookPhotoAction(fd)
      setBusy(false)
      if (res.status === 'ok') setPhotos(res.photos)
      else setError(res.message)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(name: string) {
    setDeleting(name)
    setError(null)
    const fd = new FormData()
    fd.set('titleId', String(titleId))
    fd.set('name', name)
    const res = await deleteBookPhotoAction(fd)
    setDeleting(null)
    if (res.status === 'ok') setPhotos(res.photos)
    else setError(res.message)
  }

  return (
    <div className={styles.wrap}>
      {photos.length === 0 ? (
        <p className={styles.note}>Фотографий пока нет.</p>
      ) : (
        <ul className={styles.grid}>
          {photos.map((p) => (
            <li key={p.name} className={styles.tile}>
              <Image src={p.url} alt={p.name} fill sizes='120px' className={styles.img} unoptimized />
              <button
                type='button'
                className={styles.remove}
                onClick={() => handleDelete(p.name)}
                disabled={deleting === p.name}
                aria-label={`Удалить ${p.name}`}
              >
                {deleting === p.name ? '…' : '✕'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.controls}>
        <input
          ref={inputRef}
          type='file'
          accept='image/jpeg,image/png,image/webp'
          onChange={handleUpload}
          className={styles.input}
          disabled={busy}
        />
        <button
          type='button'
          className={styles.addButton}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Загрузка…' : '+ Добавить фото'}
        </button>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    </div>
  )
}
