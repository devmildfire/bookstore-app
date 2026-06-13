'use client'

import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import Modal from '@/components/common/Modal'
import Button from '@/components/common/Button'
import AdminInput from '@/components/admin/AdminInput'
import { useToast } from '@/contexts/toast'
import { loginAction } from '@/lib/auth/actions'
import GoogleIcon from '@/assets/icons/google.svg'
import YandexIcon from '@/assets/icons/yandex.svg'
import VkIcon from '@/assets/icons/vk.svg'
import TelegramIcon from '@/assets/icons/telegram.svg'
import styles from './LoginModal.module.scss'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
})
type FormValues = z.infer<typeof schema>

export default function LoginModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  // loginAction signs in, migrates the anon cart/orders onto the account and
  // redirects to /profile on success; on failure it returns { error }.
  const [state, serverAction, pending] = useActionState(loginAction, null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // loginAction redirects to /profile, but the modal is usually already on
  // /profile, so that soft navigation doesn't re-render the server components
  // reading the new auth cookie. Detect a completed submit with no error and
  // close + refresh so the cabinet reflects the signed-in account immediately.
  const wasPending = useRef(false)
  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      onOpenChange(false)
      router.refresh()
    }
    wasPending.current = pending
  }, [pending, state, onOpenChange, router])

  const disabled = busy || pending

  const onSubmit = (data: FormValues) => {
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)
    // Dispatch inside a transition so useActionState's `pending` updates
    // correctly (it gates the success effect below).
    startTransition(() => serverAction(formData))
  }

  function handleGoogle() {
    if (disabled) return
    setBusy(true)
    // Plain top-level navigation to a Route Handler. The handler does
    // signInWithOAuth + cookie writes server-side and 302s to Google.
    // No Server Action / RSC stream is involved, so Firefox can't abort
    // a stream mid-read and surface "Error in input stream".
    window.location.assign('/api/auth/google')
  }

  function handleStub(name: string) {
    toast({ title: `${name}: скоро`, description: 'Этот способ входа появится позже.' })
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title='Вход'
      description={
        busy
          ? 'Перенаправляем на Google…'
          : 'Войдите, чтобы привязать покупки к вашему аккаунту.'
      }
      size='sm'
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {state?.error && <p className={styles.error}>{state.error}</p>}

        <label className={styles.label}>
          Email
          <AdminInput
            type='email'
            autoComplete='email'
            placeholder='your@email.com'
            disabled={disabled}
            {...register('email')}
          />
          {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
        </label>

        <label className={styles.label}>
          Пароль
          <AdminInput
            type='password'
            autoComplete='current-password'
            placeholder='••••••••'
            disabled={disabled}
            {...register('password')}
          />
          {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
        </label>

        <Button type='submit' variant='primary' size='lg' loading={pending} disabled={disabled} className={styles.submit}>
          {pending ? 'Вход…' : 'Войти'}
        </Button>

        <div className={styles.formLinks}>
          <Link href='/auth/forgot-password'>Забыли пароль?</Link>
          <Link href='/auth/register'>Создать аккаунт</Link>
        </div>
      </form>

      <div className={styles.divider}>
        <span>или войдите через</span>
      </div>

      <div className={styles.providers} aria-busy={busy}>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={handleGoogle}
          disabled={disabled}
          aria-label='Войти через Google'
        >
          <GoogleIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('Яндекс')}
          disabled={disabled}
          aria-label='Войти через Яндекс (скоро)'
        >
          <YandexIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('VK')}
          disabled={disabled}
          aria-label='Войти через VK (скоро)'
        >
          <VkIcon className={styles.providerIcon} />
        </button>
        <button
          type='button'
          className={styles.providerBtn}
          onClick={() => handleStub('Telegram')}
          disabled={disabled}
          aria-label='Войти через Telegram (скоро)'
        >
          <TelegramIcon className={styles.providerIcon} />
        </button>
      </div>
    </Modal>
  )
}
