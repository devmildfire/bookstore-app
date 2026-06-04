'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { addFeaturedTitleAction, removeFeaturedAction, moveFeaturedAction } from '@/lib/admin/featured/actions'
import type { FeaturedTitle } from '@/api/admin/featured'
import styles from './FeaturedManager.module.scss'

type Props = { featured: FeaturedTitle[]; titleOptions: { id: number; name: string }[] }

export default function FeaturedManager({ featured, titleOptions }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const selectRef = useRef<HTMLSelectElement>(null)
  const router = useRouter()

  const featuredTitleIds = new Set(featured.map((f) => f.titleId))
  const available = titleOptions.filter((t) => !featuredTitleIds.has(t.id))

  function run(action: () => Promise<{ status: string; message?: string }>) {
    setError(null)
    startTransition(async () => {
      const res = await action()
      if (res.status === 'error') setError(res.message ?? 'Ошибка')
      else router.refresh()
    })
  }

  function handleAdd() {
    const titleId = selectRef.current?.value
    if (!titleId) return
    const fd = new FormData()
    fd.set('titleId', titleId)
    run(() => addFeaturedTitleAction(fd))
  }

  function handleRemove(id: number) {
    const fd = new FormData()
    fd.set('id', String(id))
    run(() => removeFeaturedAction(fd))
  }

  function handleMove(id: number, dir: 'up' | 'down') {
    const fd = new FormData()
    fd.set('id', String(id))
    fd.set('dir', dir)
    run(() => moveFeaturedAction(fd))
  }

  return (
    <div className={styles.wrap}>
      {featured.length === 0 ? (
        <p className={styles.empty}>На главной пока нет рекомендованных книг.</p>
      ) : (
        <ol className={styles.list}>
          {featured.map((f, i) => (
            <li key={f.id} className={styles.item}>
              <span className={styles.pos}>{i + 1}</span>
              <span className={styles.cover}>
                {f.coverUrl ? (
                  <Image src={f.coverUrl} alt='' fill sizes='36px' className={styles.coverImg} unoptimized />
                ) : (
                  <span className={styles.coverPlaceholder} aria-hidden />
                )}
              </span>
              <span className={styles.name}>{f.name}</span>
              <span className={styles.controls}>
                <button type='button' onClick={() => handleMove(f.id, 'up')} disabled={busy || i === 0} aria-label='Выше'>
                  ↑
                </button>
                <button
                  type='button'
                  onClick={() => handleMove(f.id, 'down')}
                  disabled={busy || i === featured.length - 1}
                  aria-label='Ниже'
                >
                  ↓
                </button>
                <button type='button' className={styles.remove} onClick={() => handleRemove(f.id)} disabled={busy}>
                  Убрать
                </button>
              </span>
            </li>
          ))}
        </ol>
      )}

      {available.length > 0 && (
        <div className={styles.add}>
          <select ref={selectRef} className={styles.select} defaultValue='' disabled={busy} aria-label='Книга'>
            <option value='' disabled>
              Выберите книгу…
            </option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
            Добавить на главную
          </button>
        </div>
      )}
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
