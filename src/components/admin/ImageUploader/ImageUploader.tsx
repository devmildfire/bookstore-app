'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import cn from 'classnames'
import styles from './ImageUploader.module.scss'

type UploadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }

function isSvg(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.svg')
}

type Props = {
  initialUrl: string | null
  // Server action that receives the FormData (file + merged `fields`) and
  // returns the new public URL. Passed in so the uploader is reusable across
  // covers, author photos, etc.
  action: (formData: FormData) => Promise<UploadResult>
  fields?: Record<string, string>
  aspect?: 'cover' | 'square'
  label?: string
  accept?: string
}

export default function ImageUploader({
  initialUrl,
  action,
  fields,
  aspect = 'cover',
  label,
  accept = 'image/jpeg,image/png,image/webp',
}: Props) {
  const [url, setUrl] = useState(initialUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError(null)
    const formData = new FormData()
    formData.set('file', file)
    for (const [k, v] of Object.entries(fields ?? {})) formData.set(k, v)
    const res = await action(formData)
    setBusy(false)
    if (res.status === 'ok') setUrl(res.url)
    else setError(res.message)
  }

  return (
    <div className={styles.wrap}>
      <div className={cn(styles.preview, styles[aspect])}>
        {url ? (
          isSvg(url) ? (
            // next/image can't render remote SVG; show it as a plain element.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={label ?? 'Изображение'} className={styles.svg} />
          ) : (
            <Image src={url} alt={label ?? 'Изображение'} fill sizes='200px' className={styles.img} unoptimized />
          )
        ) : (
          <div className={styles.placeholder} aria-hidden />
        )}
        {busy && <div className={styles.busy}>Загрузка…</div>}
      </div>
      <div className={styles.controls}>
        <input
          ref={inputRef}
          type='file'
          accept={accept}
          onChange={handleChange}
          className={styles.input}
          disabled={busy}
        />
        <button
          type='button'
          className={styles.button}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? 'Загрузка…' : 'Загрузить'}
        </button>
        {error && <span className={styles.error}>{error}</span>}
      </div>
    </div>
  )
}
