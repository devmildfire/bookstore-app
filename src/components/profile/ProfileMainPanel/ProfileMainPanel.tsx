'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useProfile } from '@/contexts/profile'
import EditProfileModal from '@/components/profile/EditProfileModal'
import ProfileIcon from '@/assets/icons/profile.svg'
import styles from './ProfileMainPanel.module.scss'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function avatarPublicUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}

type RowProps = { label: string; value: string; multiline?: boolean }

function Row({ label, value, multiline }: RowProps) {
  return (
    <div className={styles.row}>
      <dt className={styles.rowLabel}>{label}</dt>
      <dd className={multiline ? styles.rowValueMulti : styles.rowValue}>{value}</dd>
    </div>
  )
}

export default function ProfileMainPanel() {
  const { profile } = useProfile()
  const [editOpen, setEditOpen] = useState(false)

  const avatarSrc = profile.avatarPath
    ? `${avatarPublicUrl(profile.avatarPath)}?v=${encodeURIComponent(profile.updatedAt)}`
    : null

  return (
    <section className={styles.panel}>
      <div className={styles.avatar}>
        {avatarSrc ? (
          <Image src={avatarSrc} alt='' fill sizes='250px' className={styles.avatarImg} unoptimized />
        ) : (
          <ProfileIcon className={styles.avatarPlaceholder} />
        )}
      </div>

      <h2 className={styles.nickname}>{profile.nickname}</h2>
      {profile.city && <p className={styles.city}>{profile.city}</p>}

      <button type='button' className={styles.editBtn} onClick={() => setEditOpen(true)}>
        Редактировать профиль
      </button>

      <dl className={styles.list}>
        <Row label='ФИО' value={profile.fullName ?? '—'} />
        <Row label='Номер телефона' value={profile.phone ?? '—'} />
        <Row label='Дата рождения' value={formatDate(profile.birthday)} />
        <Row label='О себе' value={profile.about ?? '—'} multiline />
      </dl>

      <EditProfileModal open={editOpen} onOpenChange={setEditOpen} />
    </section>
  )
}
