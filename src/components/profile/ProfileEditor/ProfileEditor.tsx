'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useProfile } from '@/contexts/profile'
import { updateProfileAction } from '@/lib/profile/actions'
import { profileEditSchema, type ProfileEditValues } from '@/entities/profile/validation'
import AvatarUpload from '@/components/profile/AvatarUpload'
import AdminDatePicker from '@/components/admin/AdminDatePicker'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import styles from './ProfileEditor.module.scss'

type Props = {
  // Called after a successful save so the parent (modal) can dismiss.
  onDone?: () => void
}

export default function ProfileEditor({ onDone }: Props) {
  const { profile, setProfile } = useProfile()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      nickname: profile.nickname,
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      birthday: profile.birthday ?? '',
      city: profile.city ?? '',
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
      city: values.city,
      about: values.about,
    })
    if (result.status === 'ok') {
      setProfile(result.profile)
      onDone?.()
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
      city: profile.city ?? '',
      about: profile.about ?? '',
    })
    setSubmitError(null)
    onDone?.()
  }

  return (
    <div className={styles.editor}>
      <div className={styles.avatarRow}>
        <AvatarUpload />
      </div>

      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label htmlFor='profile-nickname' className={styles.label}>Никнейм</label>
          <Input id='profile-nickname' {...register('nickname')} />
          {errors.nickname && <p className={styles.error}>{errors.nickname.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='profile-fullName' className={styles.label}>
            ФИО <span className={styles.optional}>(необязательно)</span>
          </label>
          <Input id='profile-fullName' {...register('fullName')} />
          {errors.fullName && <p className={styles.error}>{errors.fullName.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='profile-phone' className={styles.label}>
            Телефон <span className={styles.optional}>(необязательно)</span>
          </label>
          <Input id='profile-phone' type='tel' {...register('phone')} />
          {errors.phone && <p className={styles.error}>{errors.phone.message}</p>}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Дата рождения <span className={styles.optional}>(необязательно)</span>
          </span>
          <Controller
            name='birthday'
            control={control}
            render={({ field }) => (
              <AdminDatePicker value={field.value ?? ''} onChange={field.onChange} ariaLabel='Дата рождения' />
            )}
          />
          {errors.birthday && <p className={styles.error}>{errors.birthday.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='profile-city' className={styles.label}>
            Город <span className={styles.optional}>(необязательно)</span>
          </label>
          <Input id='profile-city' {...register('city')} />
          {errors.city && <p className={styles.error}>{errors.city.message}</p>}
        </div>

        <div className={styles.field}>
          <label htmlFor='profile-about' className={styles.label}>
            О себе <span className={styles.optional}>(необязательно)</span>
          </label>
          <Textarea id='profile-about' rows={6} {...register('about')} />
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
    </div>
  )
}
