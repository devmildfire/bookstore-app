'use client'

import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import { submitStorySubmission } from '@/api/stories/submitStorySubmission'
import { notifyStorySubmissionAction } from '@/lib/stories/actions'
import {
  STORY_ACCEPT,
  STORY_ALLOWED_EXTENSIONS,
  STORY_MAX_MB,
  validateStoryFile,
  STORY_FILE_ERROR_MESSAGES,
} from '@/entities/story/validation'
import styles from './StorySubmitModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isAnon: boolean
  userEmail: string | null
}

const FEEDBACK_MAX = 5000

// The cover-letter field doubles as the author's contact/feedback channel.
// For an anonymous author it's the only durable way to reach them once their
// session cookies expire, so the prompt spells that out; for a signed-in
// author we name the channel we already have and invite a preferred one.
function feedbackPlaceholder(isAnon: boolean, userEmail: string | null): string {
  if (isAnon) {
    return (
      'Необязательно. Вы не авторизованы, поэтому связаться с вами мы сможем ' +
      'только через этот сайт и только пока в браузере сохранена сессия ' +
      '(cookies). Если хотите, чтобы мы наверняка вас нашли, оставьте здесь ' +
      'удобный способ связи — email, телефон или почтовый адрес.'
    )
  }
  const known = userEmail
    ? `на ваш email ${userEmail}`
    : 'по данным вашего аккаунта'
  return (
    `Необязательно. Мы сможем связаться с вами ${known}. ` +
    'Если предпочитаете другой способ связи, оставьте его здесь — ' +
    'другой email, телефон или почтовый адрес.'
  )
}

export default function StorySubmitModal({ open, onOpenChange, isAnon, userEmail }: Props) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} size='xl'>
      {/* StoryForm is mounted only while open, so its state resets on every
          open. It renders its own Dialog.Title (form vs success heading). */}
      <StoryForm
        onClose={() => onOpenChange(false)}
        feedbackPrompt={feedbackPlaceholder(isAnon, userEmail)}
      />
    </Modal>
  )
}

function StoryForm({
  onClose,
  feedbackPrompt,
}: {
  onClose: () => void
  feedbackPrompt: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [authorName, setAuthorName] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  function handleFile(picked: File) {
    setFormError(null)
    const error = validateStoryFile(picked)
    if (error) {
      setFile(null)
      setFileError(STORY_FILE_ERROR_MESSAGES[error])
      return
    }
    setFileError(null)
    setFile(picked)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file
    if (picked) handleFile(picked)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!authorName.trim()) {
      setFormError('Введите авторское имя.')
      return
    }
    if (!file) {
      setFileError('Прикрепите файл рассказа.')
      return
    }

    setBusy(true)
    const result = await submitStorySubmission({ file, authorName, coverLetter })
    setBusy(false)

    if (result.status === 'ok') {
      setDone(true)
      // Notify the editorial team — best-effort, must not block or fail the UI.
      void notifyStorySubmissionAction({ authorName, coverLetter, path: result.path }).catch((err) => {
        console.error('[story submission] notification failed', err)
      })
    } else {
      setFormError(result.message)
    }
  }

  if (done) {
    return (
      <div className={styles.success}>
        <Dialog.Title className={styles.title}>Спасибо!</Dialog.Title>
        <p className={styles.successText}>
          Рассказ отправлен на рассмотрение. Мы свяжемся с вами по результатам.
        </p>
        <Button variant='cta' className={styles.submit} onClick={onClose}>
          Закрыть
        </Button>
      </div>
    )
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Dialog.Title className={styles.title}>Заполните форму</Dialog.Title>

      <label className={styles.field}>
        <span className={styles.label}>Авторское имя</span>
        <Input
          type='text'
          value={authorName}
          onChange={(e) => {
            setAuthorName(e.target.value)
            if (formError) setFormError(null)
          }}
          placeholder='Федотов Виктор'
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Сопроводительное письмо</span>
        <Textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder={feedbackPrompt}
          rows={5}
          maxLength={FEEDBACK_MAX}
        />
      </label>

      <div className={styles.upload}>
        <Button
          variant='ctaOutline'
          type='button'
          className={styles.uploadButton}
          onClick={() => inputRef.current?.click()}
        >
          Загрузить рассказ
        </Button>
        <p className={styles.hint}>
          {STORY_ALLOWED_EXTENSIONS.join(', ')} · до {STORY_MAX_MB} МБ
        </p>
        <input
          ref={inputRef}
          type='file'
          accept={STORY_ACCEPT}
          onChange={handleInputChange}
          className={styles.fileInput}
        />
        {file && (
          <p className={styles.fileName}>
            <span className={styles.fileNameText}>{file.name}</span>
            <button
              type='button'
              className={styles.fileRemove}
              onClick={() => setFile(null)}
              aria-label='Убрать файл'
            >
              ×
            </button>
          </p>
        )}
        {fileError && <p className={styles.error}>{fileError}</p>}
      </div>

      {formError && <p className={styles.error}>{formError}</p>}

      <Button variant='cta' type='submit' className={styles.submit} disabled={busy}>
        {busy ? 'Отправляем…' : 'Отправить на рассмотрение'}
      </Button>
    </form>
  )
}
