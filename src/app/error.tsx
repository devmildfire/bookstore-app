'use client'

import styles from './error.module.scss'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ reset }: Props) {
  return (
    <div className={styles.wrap} role='alert'>
      <h1 className={styles.title}>Что-то пошло не так</h1>
      <p className={styles.msg}>Произошла непредвиденная ошибка. Попробуйте обновить страницу.</p>
      <button type='button' className={styles.retry} onClick={reset}>
        Попробовать снова
      </button>
    </div>
  )
}
