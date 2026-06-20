'use client'

import Button from '@/components/common/Button'
import styles from './error.module.scss'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StorefrontError({ reset }: Props) {
  return (
    <section className={styles.error} role='alert'>
      <h1 className={styles.title}>Не удалось загрузить страницу</h1>
      <p className={styles.msg}>Попробуйте обновить страницу или вернуться на главную.</p>
      <div className={styles.actions}>
        <Button type='button' onClick={reset}>
          Попробовать снова
        </Button>
        <Button type='button' variant='secondary' href='/'>
          На главную
        </Button>
      </div>
    </section>
  )
}
