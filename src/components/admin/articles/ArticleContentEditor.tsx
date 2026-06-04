'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadArticleContentImageAction } from '@/lib/admin/articles/actions'
import { blocksToText, textToBlocks, type ContentBlock } from '@/lib/admin/articleContent'
import { getArticleImageUrl } from '@/lib/storage'
import styles from './ArticleContentEditor.module.scss'

type Props = { articleId: number; initialText: string }

export default function ArticleContentEditor({ articleId, initialText }: Props) {
  const [text, setText] = useState(initialText)
  const [caption, setCaption] = useState('')
  const [busy, startUpload] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Image blocks currently referenced in the text (in document order).
  const images = useMemo(
    () => textToBlocks(text).filter((b): b is Extract<ContentBlock, { kind: 'image' }> => b.kind === 'image'),
    [text]
  )

  function removeImage(imgIndex: number) {
    const blocks = textToBlocks(text)
    let seen = -1
    const next = blocks.filter((b) => {
      if (b.kind !== 'image') return true
      seen += 1
      return seen !== imgIndex
    })
    setText(blocksToText(next))
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setError(null)
      const cap = caption.trim()
      startUpload(async () => {
        const fd = new FormData()
        fd.set('articleId', String(articleId))
        fd.set('file', file)
        const res = await uploadArticleContentImageAction(fd)
        if (res.status === 'error') {
          setError(res.message)
          return
        }
        const blocks = textToBlocks(text)
        blocks.push({ kind: 'image', path: res.path, caption: cap || null })
        setText(blocksToText(blocks))
        setCaption('')
      })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className={styles.wrap}>
      <textarea name='content' value={text} onChange={(e) => setText(e.target.value)} className={styles.text} rows={18} />

      <div className={styles.images}>
        <span className={styles.imagesLabel}>Картинки в тексте</span>
        {images.length === 0 ? (
          <p className={styles.note}>В статье пока нет картинок.</p>
        ) : (
          <ul className={styles.grid}>
            {images.map((img, i) => (
              <li key={`${img.path}-${i}`} className={styles.tile}>
                <span className={styles.thumb}>
                  {getArticleImageUrl(img.path) ? (
                    <Image src={getArticleImageUrl(img.path) as string} alt='' fill sizes='140px' className={styles.thumbImg} unoptimized />
                  ) : (
                    <span className={styles.thumbPlaceholder} aria-hidden />
                  )}
                </span>
                {img.caption && <span className={styles.caption}>{img.caption}</span>}
                <button type='button' className={styles.remove} onClick={() => removeImage(i)} aria-label='Убрать картинку'>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.add}>
          <input
            type='text'
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder='Подпись (необязательно)'
            className={styles.captionInput}
            disabled={busy}
          />
          <input
            ref={fileRef}
            type='file'
            accept='image/jpeg,image/png,image/webp'
            onChange={handleFile}
            className={styles.fileInput}
            disabled={busy}
          />
          <button type='button' className={styles.addButton} onClick={() => fileRef.current?.click()} disabled={busy}>
            {busy ? 'Загрузка…' : '+ Добавить картинку'}
          </button>
        </div>
        <p className={styles.hint}>
          Картинка добавляется в конец; чтобы поставить её между абзацами, перенесите строку{' '}
          <code>[img: …]</code> в нужное место текста.
        </p>
        {error && <span className={styles.err}>{error}</span>}
      </div>
    </div>
  )
}
