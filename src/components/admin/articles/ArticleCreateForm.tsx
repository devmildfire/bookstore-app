'use client'

import { useActionState } from 'react'
import { createArticleAction } from '@/lib/admin/articles/actions'
import Button from '@/components/common/Button'
import styles from './ArticleCreateForm.module.scss'

type Props = { authorOptions: { id: number; name: string }[] }

export default function ArticleCreateForm({ authorOptions }: Props) {
  const [state, action, pending] = useActionState(createArticleAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Контент и обложку добавите на следующем шаге.</p>
      <label className={styles.label}>
        Заголовок
        <input name='title' className={styles.input} required />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <input name='slug' className={styles.input} required />
      </label>
      <label className={styles.label}>
        Автор
        <select name='authorId' className={styles.input} defaultValue=''>
          <option value='' disabled>
            Выберите автора…
          </option>
          {authorOptions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Создание…' : 'Создать'}
        </Button>
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
