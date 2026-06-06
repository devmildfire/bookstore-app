'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { uploadTrailerFileAction, removeTrailerAction } from '@/lib/admin/books/actions'
import styles from './TrailerManager.module.scss'

type Props = {
  titleId: number
  hasSlug: boolean
  trailer: { exists: boolean; hasPoster: boolean }
  urls: { mp4: string; webm: string; poster: string | null } | null
}

const SLOTS: { kind: 'mp4' | 'webm' | 'poster'; label: string; accept: string }[] = [
  { kind: 'mp4', label: 'Видео MP4', accept: 'video/mp4' },
  { kind: 'webm', label: 'Видео WebM', accept: 'video/webm' },
  { kind: 'poster', label: 'Постер', accept: 'image/jpeg,image/png' },
]

export default function TrailerManager({ titleId, hasSlug, trailer, urls }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!hasSlug) {
    return <p className={styles.note}>Сначала задайте slug книги — трейлер хранится в папке по slug.</p>
  }

  function upload(kind: string, file: File) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      fd.set('kind', kind)
      fd.set('file', file)
      const res = await uploadTrailerFileAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  function removeTrailer() {
    if (!confirm('Удалить трейлер целиком (видео и постер)?')) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('titleId', String(titleId))
      const res = await removeTrailerAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.wrap}>
      {trailer.exists && urls ? (
        <div className={styles.preview}>
          <video className={styles.video} controls poster={trailer.hasPoster ? urls.poster ?? undefined : undefined}>
            <source src={urls.mp4} type='video/mp4' />
            <source src={urls.webm} type='video/webm' />
          </video>
          {trailer.hasPoster && urls.poster && (
            <div className={styles.posterThumb}>
              <Image src={urls.poster} alt='Постер' fill sizes='420px' unoptimized />
            </div>
          )}
        </div>
      ) : (
        <p className={styles.note}>Трейлер не загружен.</p>
      )}

      <div className={styles.slots}>
        {SLOTS.map((slot) => (
          <Slot key={slot.kind} {...slot} busy={busy} onPick={upload} />
        ))}
        {trailer.exists && (
          <button type='button' className={styles.remove} onClick={removeTrailer} disabled={busy}>
            Удалить трейлер
          </button>
        )}
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}

function Slot({
  kind,
  label,
  accept,
  busy,
  onPick,
}: {
  kind: string
  label: string
  accept: string
  busy: boolean
  onPick: (kind: string, file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <span className={styles.slot}>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        className={styles.input}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onPick(kind, f)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <button type='button' className={styles.slotButton} onClick={() => inputRef.current?.click()} disabled={busy}>
        {label}
      </button>
    </span>
  )
}
