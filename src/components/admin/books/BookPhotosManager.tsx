'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { uploadBookPhotoAction, deleteBookPhotoAction } from '@/lib/admin/books/actions'
import type { AdminBookPhoto, AdminEditionPhotos } from '@/api/admin/books'
import { BOOK_PHOTO_SECTIONS, type BookPhotoFolder } from '@/consts/bookPhotos'
import styles from './BookPhotosManager.module.scss'

type Props = {
  titleId: number
  hasSlug: boolean
  initialPhotos: AdminEditionPhotos
}

export default function BookPhotosManager({ titleId, hasSlug, initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos)
  const [error, setError] = useState<string | null>(null)

  if (!hasSlug) {
    return (
      <p className={styles.note}>
        Сначала задайте slug книги и сохраните — фото хранятся в папке по slug.
      </p>
    )
  }

  return (
    <div className={styles.wrap}>
      {BOOK_PHOTO_SECTIONS.map((section) => (
        <PhotoSection
          key={section.folder}
          titleId={titleId}
          folder={section.folder}
          label={section.label}
          photos={photos[section.folder]}
          onChange={setPhotos}
          onError={setError}
        />
      ))}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}

type SectionProps = {
  titleId: number
  folder: BookPhotoFolder
  label: string
  photos: AdminBookPhoto[]
  onChange: (photos: AdminEditionPhotos) => void
  onError: (message: string | null) => void
}

function PhotoSection({ titleId, folder, label, photos, onChange, onError }: SectionProps) {
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setBusy(true)
      onError(null)
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('folder', folder)
      fd.set('file', file)
      const res = await uploadBookPhotoAction(fd)
      setBusy(false)
      if (res.status === 'ok') onChange(res.photos)
      else onError(res.message)
    }
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(name: string) {
    setDeleting(name)
    onError(null)
    const fd = new FormData()
    fd.set('titleId', String(titleId))
    fd.set('folder', folder)
    fd.set('name', name)
    const res = await deleteBookPhotoAction(fd)
    setDeleting(null)
    if (res.status === 'ok') onChange(res.photos)
    else onError(res.message)
  }

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>{label}</h4>
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
      </div>
    </section>
  )
}
