'use client'

import { useActionState } from 'react'
import { createTeamMemberAction } from '@/lib/admin/team/actions'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import styles from './MemberForm.module.scss'

export default function MemberCreateForm() {
  const [state, action, pending] = useActionState(createTeamMemberAction, null)
  return (
    <form action={action} className={styles.form}>
      <p className={styles.note}>Фото и город добавите на следующем шаге.</p>
      <label className={styles.label}>
        Имя
        <Input name='name' required placeholder='Например: Андрей Янкус' />
      </label>
      <label className={styles.label}>
        Должность
        <Input name='job' required placeholder='Например: продюсер' />
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
