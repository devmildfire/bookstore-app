'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { uploadAvatar } from '@/api/profile/uploadAvatar'
import { getAvatarUrl } from '@/lib/storage'
import { useProfile } from '@/contexts/profile'
import { updateProfileAction } from '@/lib/profile/actions'
import {
  AVATAR_MAX_BYTES,
  AVATAR_MIME_TYPES,
  type AvatarMimeType,
} from '@/entities/profile/validation'
import styles from './AvatarUpload.module.scss'

const EXT_BY_MIME: Record<AvatarMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export default function AvatarUpload() {
  const { profile, setProfile } = useProfile()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)

    if (!(AVATAR_MIME_TYPES as readonly string[]).includes(file.type)) {
      setError('Только JPEG, PNG или WEBP.')
      return
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setError('Файл больше 2 МБ.')
      return
    }

    const ext = EXT_BY_MIME[file.type as AvatarMimeType]
    const path = `${profile.userId}/avatar.${ext}`

    setBusy(true)
    try {
      await uploadAvatar(path, file)
    } catch (uploadError) {
      setBusy(false)
      setError(`Не удалось загрузить: ${uploadError instanceof Error ? uploadError.message : 'ошибка'}`)
      return
    }

    const result = await updateProfileAction({ avatarPath: path })
    setBusy(false)

    if (result.status === 'ok') {
      setProfile(result.profile)
    } else {
      setError(result.message)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (file) handleFile(file)
  }

  const imgUrl = getAvatarUrl(profile.avatarPath)
  // Cache-bust on changes so a re-upload with the same key replaces the cached image.
  const imgSrc = imgUrl ? `${imgUrl}?v=${encodeURIComponent(profile.updatedAt)}` : null

  return (
    <div className={styles.root}>
      <button
        type='button'
        className={styles.avatar}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        aria-label='Загрузить аватар'
      >
        {imgSrc ? (
          <Image src={imgSrc} alt='' fill sizes='160px' className={styles.image} unoptimized />
        ) : (
          <span className={styles.placeholder} aria-hidden>
            <svg width='40' height='40' viewBox='0 0 24 24' fill='none'>
              <circle cx='12' cy='8' r='4' stroke='currentColor' strokeWidth='1.5' />
              <path d='M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6' stroke='currentColor' strokeWidth='1.5' />
            </svg>
          </span>
        )}
        <span className={styles.overlay}>{busy ? '…' : 'Изменить'}</span>
      </button>

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        onChange={handleChange}
        className={styles.input}
      />

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
