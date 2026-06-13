'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addAuthorContactAction, removeAuthorContactAction } from '@/lib/admin/authors/actions'
import Select from '@/components/common/Select'
import {
  AUTHOR_CONTACT_CHANNELS,
  CONTACT_CHANNEL_LABEL,
  type AdminAuthorContact,
  type AuthorContactChannel,
} from '@/lib/admin/authorContacts'
import Input from '@/components/common/Input'
import {
  VkIcon,
  TelegramIcon,
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  EmailIcon,
  WebsiteIcon,
} from '@/components/common/BrandIcons'
import styles from './ContactsManager.module.scss'

const CHANNEL_ICON: Record<AuthorContactChannel, React.FC<{ className?: string }>> = {
  vk: VkIcon,
  telegram: TelegramIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  email: EmailIcon,
  website: WebsiteIcon,
}

type Props = { authorId: number; contacts: AdminAuthorContact[] }

export default function ContactsManager({ authorId, contacts }: Props) {
  const [busy, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<string>(AUTHOR_CONTACT_CHANNELS[0])
  const urlRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleAdd() {
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
          {contacts.map((c) => {
            const Icon = CHANNEL_ICON[c.channel]
            return (
            <li key={c.id} className={styles.item}>
              <span className={styles.channelIcon} title={CONTACT_CHANNEL_LABEL[c.channel]} aria-label={CONTACT_CHANNEL_LABEL[c.channel]}>
                <Icon />
              </span>
              <span className={styles.url}>{c.url}</span>
              <button type='button' onClick={() => handleRemove(c.id)} disabled={busy} aria-label='Удалить контакт'>
                ✕
              </button>
            </li>
            )
          })}
        </ul>
      )}

      <div className={styles.add}>
        <Select
          name='channel'
          defaultValue={AUTHOR_CONTACT_CHANNELS[0]}
          ariaLabel='Канал'
          onChange={setChannel}
          options={AUTHOR_CONTACT_CHANNELS.map((ch) => ({ value: ch, label: CONTACT_CHANNEL_LABEL[ch] }))}
        />
        <Input ref={urlRef} placeholder='https://… или email' disabled={busy} />
        <button type='button' className={styles.addButton} onClick={handleAdd} disabled={busy}>
          Добавить
        </button>
      </div>
      {error && <span className={styles.err}>{error}</span>}
    </div>
  )
}
