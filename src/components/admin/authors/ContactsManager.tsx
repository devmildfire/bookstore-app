'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addAuthorContactAction, removeAuthorContactAction } from '@/lib/admin/authors/actions'
import {
  AUTHOR_CONTACT_CHANNELS,
  CONTACT_CHANNEL_LABEL,
  type AdminAuthorContact,
} from '@/lib/admin/authorContacts'
import styles from './ContactsManager.module.scss'

type Props = { authorId: number; contacts: AdminAuthorContact[] }

export default function ContactsManager({ authorId, contacts }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<HTMLSelectElement>(null)
  const urlRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleAdd() {
    const channel = channelRef.current?.value
    const url = urlRef.current?.value.trim()
    if (!channel || !url) {
      setError('Выберите канал и введите ссылку.')
      return
    }
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('authorId', String(authorId))
      fd.set('channel', channel)
      fd.set('url', url)
      const res = await addAuthorContactAction(fd)
      if (res.status === 'error') setError(res.message)
      else {
        if (urlRef.current) urlRef.current.value = ''
        router.refresh()
      }
    })
  }

  function handleRemove(contactId: number) {
    setError(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('authorId', String(authorId))
      fd.set('contactId', String(contactId))
      const res = await removeAuthorContactAction(fd)
      if (res.status === 'error') setError(res.message)
      else router.refresh()
    })
  }

  return (
    <div className={styles.wrap}>
      {contacts.length === 0 ? (
        <p className={styles.empty}>Контакты не добавлены.</p>
      ) : (
        <ul className={styles.list}>
          {contacts.map((c) => (
            <li key={c.id} className={styles.item}>
              <span className={styles.channel}>{CONTACT_CHANNEL_LABEL[c.channel]}</span>
              <span className={styles.url}>{c.url}</span>
              <button type='button' onClick={() => handleRemove(c.id)} disabled={busy} aria-label='Удалить контакт'>
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.add}>
        <select ref={channelRef} className={styles.select} defaultValue={AUTHOR_CONTACT_CHANNELS[0]} disabled={busy}>
          {AUTHOR_CONTACT_CHANNELS.map((ch) => (
            <option key={ch} value={ch}>
              {CONTACT_CHANNEL_LABEL[ch]}
            </option>
          ))}
        </select>
        <input ref={urlRef} className={styles.input} placeholder='https://… или email' disabled={busy} />
        <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
          Добавить
        </button>
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
