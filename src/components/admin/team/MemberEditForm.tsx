'use client'

import { useActionState, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateTeamMemberAction, removeTeamMemberAction } from '@/lib/admin/team/actions'
import Button from '@/components/common/Button'
import type { AdminTeamMember } from '@/api/admin/team'
import Input from '@/components/common/Input'
import styles from './MemberForm.module.scss'

export default function MemberEditForm({ member }: { member: AdminTeamMember }) {
  const [state, action, pending] = useActionState(updateTeamMemberAction, null)
  const [removing, startRemove] = useTransition()
  const [removeError, setRemoveError] = useState<string | null>(null)
  const router = useRouter()

  function handleRemove() {
    if (!confirm(`Убрать «${member.name}» из команды? Участник перестанет показываться на странице «О Чтиве».`)) return
    setRemoveError(null)
    startRemove(async () => {
      const fd = new FormData()
      fd.set('id', String(member.id))
      const res = await removeTeamMemberAction(null, fd)
      if (res?.status === 'error') setRemoveError(res.message)
      else router.refresh()
    })
  }

  return (
    <form action={action} className={styles.form}>
      <input type='hidden' name='id' value={member.id} />

      <div className={styles.grid}>
        <label className={styles.label}>
          Имя
          <Input name='name' defaultValue={member.name} required />
        </label>
        <label className={styles.label}>
          Должность
          <Input name='job' defaultValue={member.job} required />
        </label>
      </div>

      <div className={styles.grid}>
        <label className={styles.label}>
          Город
          <Input name='city' defaultValue={member.city ?? ''} placeholder='Например: Санкт-Петербург' />
        </label>
        <label className={styles.label}>
          Позиция
          <Input name='position' type='number' min={0} defaultValue={member.position} />
        </label>
      </div>

      <div className={styles.actions}>
        <Button type='submit' variant='primary' size='md' loading={pending}>
          {pending ? 'Сохранение…' : 'Сохранить'}
        </Button>
        {state?.status === 'ok' && <span className={styles.ok}>Сохранено</span>}
        {state?.status === 'error' && <span className={styles.err}>{state.message}</span>}
      </div>

      <div className={styles.danger}>
        <button type='button' className={styles.delete} onClick={handleRemove} disabled={removing}>
          {removing ? 'Удаление…' : 'Убрать из команды'}
        </button>
        {removeError && <span className={styles.err}>{removeError}</span>}
      </div>
    </form>
  )
}
