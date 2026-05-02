'use client'

import Button from '@/components/common/Button'
import styles from './error.module.scss'

type Props = {
  reset: () => void
}

export default function BooksError({ reset }: Props) {
  return (
    <section className={styles.error} role='alert'>
      <h1>Не удалось загрузить каталог</h1>
      <p>Попробуйте обновить список книг.</p>
      <Button type='button' onClick={reset}>
        Попробовать снова
      </Button>
    </section>
  )
}
