'use client'

import { useActionState } from 'react'
import { createArticleAction } from '@/lib/admin/articles/actions'
import Button from '@/components/common/Button'
import AdminSelect from '@/components/admin/AdminSelect'
import Input from '@/components/common/Input'
import styles from './ArticleCreateForm.module.scss'

type Props = { authorOptions: { id: number; name: string }[] }

export default function ArticleCreateForm({ authorOptions }: Props) {
  const [state, action, pending] = useActionState(createArticleAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Контент и обложку добавите на следующем шаге.</p>
      <label className={styles.label}>
        Заголовок
        <Input name='title' required />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <Input name='slug' required />
      </label>
      <div className={styles.label}>
        <span>Автор</span>
        <AdminSelect
          name='authorId'
          defaultValue=''
          ariaLabel='Автор'
          options={[
            { value: '', label: 'Выберите автора…' },
            ...authorOptions.map((a) => ({ value: String(a.id), label: a.name })),
          ]}
        />
      </div>
      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Создание…' : 'Создать'}
        </Button>
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>
    </form>
  )
}
