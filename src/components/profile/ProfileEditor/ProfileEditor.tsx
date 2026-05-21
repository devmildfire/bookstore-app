'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile } from '@/contexts/profile'
import { updateProfileAction } from '@/lib/profile/actions'
import { profileEditSchema, type ProfileEditValues } from '@/entities/profile/validation'
import AvatarUpload from '@/components/profile/AvatarUpload'
import styles from './ProfileEditor.module.scss'

type Props = {
  isAnon: boolean
  userEmail: string | null
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return iso
  }
}

export default function ProfileEditor({ isAnon, userEmail }: Props) {
  const { profile, setProfile } = useProfile()
  const [editing, setEditing] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      nickname: profile.nickname,
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      birthday: profile.birthday ?? '',
      about: profile.about ?? '',
    },
  })

  async function onSubmit(values: ProfileEditValues) {
    setSubmitError(null)
    const result = await updateProfileAction({
      nickname: values.nickname,
      fullName: values.fullName,
      phone: values.phone,
      birthday: values.birthday,
      about: values.about,
    })
    if (result.status === 'ok') {
      setProfile(result.profile)
      setEditing(false)
      return
    }
    setSubmitError(result.message)
  }

  function handleCancel() {
    reset({
      nickname: profile.nickname,
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      birthday: profile.birthday ?? '',
      about: profile.about ?? '',
    })
    setSubmitError(null)
    setEditing(false)
  }

  return (
    <section className={styles.editor}>
      <div className={styles.headRow}>
        <AvatarUpload />
        <div className={styles.headText}>
          <h2 className={styles.nickname}>{profile.nickname}</h2>
          <p className={styles.subtitle}>{isAnon ? 'Гость' : (userEmail ?? '')}</p>
          {!editing && (
            <button type='button' className={styles.editBtn} onClick={() => setEditing(true)}>
              Редактировать профиль
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className={styles.field}>
            <label htmlFor='profile-nickname' className={styles.label}>Никнейм</label>
            <input id='profile-nickname' className={styles.input} {...register('nickname')} />
            {errors.nickname && <p className={styles.error}>{errors.nickname.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor='profile-fullName' className={styles.label}>
              ФИО <span className={styles.optional}>(необязательно)</span>
            </label>
            <input id='profile-fullName' className={styles.input} {...register('fullName')} />
            {errors.fullName && <p className={styles.error}>{errors.fullName.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor='profile-phone' className={styles.label}>
              Телефон <span className={styles.optional}>(необязательно)</span>
            </label>
            <input id='profile-phone' type='tel' className={styles.input} {...register('phone')} />
            {errors.phone && <p className={styles.error}>{errors.phone.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor='profile-birthday' className={styles.label}>
              Дата рождения <span className={styles.optional}>(необязательно)</span>
            </label>
            <input id='profile-birthday' type='date' className={styles.input} {...register('birthday')} />
            {errors.birthday && <p className={styles.error}>{errors.birthday.message}</p>}
          </div>

          <div className={styles.field}>
            <label htmlFor='profile-about' className={styles.label}>
              О себе <span className={styles.optional}>(необязательно)</span>
            </label>
            <textarea
              id='profile-about'
              rows={6}
              className={styles.textarea}
              {...register('about')}
            />
            {errors.about && <p className={styles.error}>{errors.about.message}</p>}
          </div>

          {submitError && <p className={styles.error}>{submitError}</p>}

          <div className={styles.actions}>
            <button type='submit' className={styles.save} disabled={isSubmitting}>
              {isSubmitting ? 'Сохраняем…' : 'Сохранить'}
            </button>
            <button type='button' className={styles.cancel} onClick={handleCancel} disabled={isSubmitting}>
              Отмена
            </button>
          </div>
        </form>
      ) : (
        <dl className={styles.list}>
          <Row label='ФИО' value={profile.fullName ?? '—'} />
          <Row label='Номер телефона' value={profile.phone ?? '—'} />
          <Row label='Дата рождения' value={formatDate(profile.birthday)} />
          <Row label='О себе' value={profile.about ?? '—'} multiline />
        </dl>
      )}
    </section>
  )
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={multiline ? styles.rowValueMulti : styles.rowValue}>{value}</dd>
    </div>
  )
}
