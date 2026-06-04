'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getSubmissionDownloadUrlAction, deleteSubmissionAction } from '@/lib/admin/submissions/actions'
import type { AdminSubmission } from '@/api/admin/submissions'
import styles from './SubmissionsList.module.scss'

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export default function SubmissionsList({ submissions }: { submissions: AdminSubmission[] }) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function handleDownload(path: string) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('path', path)
      const res = await getSubmissionDownloadUrlAction(fd)
      if (res.status === 'error') setError(res.message)
      else window.open(res.url, '_blank', 'noopener')
    })
  }

  function handleDelete(path: string) {
    if (!confirm('Удалить эту заявку безвозвратно?')) return
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('path', path)
      const res = await deleteSubmissionAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  if (submissions.length === 0) {
    return <p className={styles.empty}>Заявок пока нет.</p>
  }

  return (
    <div className={styles.wrap}>
      {error && <p className={styles.err}>{error}</p>}
      <ul className={styles.list}>
        {submissions.map((s) => (
          <li key={s.path} className={styles.item}>
            <span className={styles.info}>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.meta}>
                {formatSize(s.sizeBytes)} · автор {s.userId.slice(0, 8)}…
                {s.createdAt ? ` · ${new Date(s.createdAt).toLocaleDateString('ru-RU')}` : ''}
              </span>
            </span>
            <button type='button' className={styles.download} onClick={() => handleDownload(s.path)} disabled={busy}>
              Скачать
            </button>
            <button type='button' className={styles.delete} onClick={() => handleDelete(s.path)} disabled={busy}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
