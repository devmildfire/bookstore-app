'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setBookStatusAction, deleteBookAction } from '@/lib/admin/books/actions'
import Badge, { type BadgeTone } from '@/components/common/Badge'
import type { BookStatus } from '@/api/admin/books'
import styles from './BookStatusBar.module.scss'

const STATUS_LABEL: Record<BookStatus, string> = {
  draft: 'Черновик',
  published: 'Опубликована',
  archived: 'В архиве',
}
const STATUS_TONE: Record<BookStatus, BadgeTone> = {
  draft: 'warning',
  published: 'positive',
  archived: 'neutral',
}

type Props = { bookId: number; status: BookStatus; name: string }

export default function BookStatusBar({ bookId, status, name }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function changeStatus(next: BookStatus) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', String(bookId))
      fd.set('status', next)
      const res = await setBookStatusAction(null, fd)
      if (res?.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  function handleDelete() {
    if (!confirm(`Удалить книгу «${name}» со всеми продуктами и файлами? Это действие необратимо.`)) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', String(bookId))
      const res = await deleteBookAction(null, fd)
      // On success the action redirects; only an error returns here.
      if (res?.status === 'error') setError(res.message)
    })
  }

  return (
    <div className={styles.bar}>
      <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>

      <div className={styles.actions}>
        {status !== 'published' && (
          <button type='button' className={styles.primary} onClick={() => changeStatus('published')} disabled={busy}>
            Опубликовать
          </button>
        )}
        {status === 'published' && (
          <>
            <button type='button' className={styles.ghost} onClick={() => changeStatus('archived')} disabled={busy}>
              В архив
            </button>
            <button type='button' className={styles.ghost} onClick={() => changeStatus('draft')} disabled={busy}>
              В черновик
            </button>
          </>
        )}
        {status !== 'published' && (
          <button type='button' className={styles.danger} onClick={handleDelete} disabled={busy}>
            Удалить книгу
          </button>
        )}
      </div>

      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
