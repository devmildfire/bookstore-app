'use client'

import Button from '@/components/common/Button'
import styles from './error.module.scss'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BookDetailError({ error, reset }: Props) {
  return (
    <section className={styles.error} role='alert'>
      <h1>Не удалось загрузить книгу</h1>
      <p>Попробуйте обновить страницу или вернуться в каталог.</p>
      <div className={styles.actions}>
        <Button type='button' onClick={reset}>
          Попробовать снова
        </Button>
        <Button type='button' variant='secondary' onClick={() => window.history.back()}>
          Назад
        </Button>
      </div>
    </section>
  )
}
