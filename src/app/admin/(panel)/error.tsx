'use client'

import styles from './error.module.scss'

type Props = { error: Error & { digest?: string }; reset: () => void }

export default function AdminPanelError({ reset }: Props) {
  return (
    <div className={styles.wrap} role='alert'>
      <p className={styles.msg}>Не удалось загрузить раздел.</p>
      <button type='button' className={styles.retry} onClick={reset}>
        Попробовать снова
      </button>
    </div>
  )
}
