'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateArticleAction, deleteArticleAction } from '@/lib/admin/articles/actions'
import { blocksToText } from '@/lib/admin/articleContent'
import Button from '@/components/common/Button'
import ArticleContentEditor from './ArticleContentEditor'
import type { AdminArticle } from '@/api/admin/articles'
import styles from './ArticleEditForm.module.scss'

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

type Props = { article: AdminArticle; authorOptions: { id: number; name: string }[] }

export default function ArticleEditForm({ article, authorOptions }: Props) {
  const [state, action, pending] = useActionState(updateArticleAction, null)
  const [deleting, startDelete] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()

  function handleDelete() {
    if (!confirm(`Удалить статью «${article.title}»?`)) return
    setDeleteError(null)
    startDelete(async () => {
      const fd = new FormData()
      fd.set('id', String(article.id))
      const res = await deleteArticleAction(null, fd)
      if (res?.status === 'error') setDeleteError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={article.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Заголовок
          <input name='title' defaultValue={article.title} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Slug
          <input name='slug' defaultValue={article.slug} className={styles.input} required />
        </label>
        <label className={styles.label}>
          Автор
          <select name='authorId' defaultValue={article.authorId} className={styles.input}>
            {authorOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.label}>
          Дата публикации
          <input name='publishedAt' type='datetime-local' defaultValue={toLocalInput(article.publishedAt)} className={styles.input} required />
        </label>
      </div>

      <label className={styles.label}>
        Анонс (excerpt)
        <textarea name='excerpt' defaultValue={article.excerpt ?? ''} className={styles.textarea} rows={2} />
      </label>

      <div className={styles.label}>
        Текст статьи
        <span className={styles.hint}>Абзацы разделяйте пустой строкой.</span>
        <ArticleContentEditor articleId={article.id} initialText={blocksToText(article.contentBlocks)} />
      </div>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>

      <div className={styles.danger}>
        <button type='button' className={styles.delete} onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Удаление…' : 'Удалить статью'}
        </button>
        {deleteError && <span className={styles.err}>{deleteError}</span>}
      </div>
    </form>
  )
}
