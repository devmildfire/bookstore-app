'use client'

import { useActionState } from 'react'
import { createPeriodicalAction } from '@/lib/admin/periodicals/actions'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import styles from './PeriodicalForm.module.scss'

export default function PeriodicalCreateForm() {
  const [state, action, pending] = useActionState(createPeriodicalAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>
        Slug — адрес общей страницы серии (например <code>moguchij-russkij-dinozavr</code>). Выпуски
        привязываются к серии в карточке книги (раздел «Периодика»).
      </p>
      <label className={styles.label}>
        Название
        <AdminInput name='name' required placeholder='Например: Могучий Русский Динозавр' />
      </label>
      <label className={styles.label}>
        Slug (латиница, цифры, дефис)
        <AdminInput name='slug' required placeholder='moguchij-russkij-dinozavr' />
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
