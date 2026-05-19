'use client'

import { useState } from 'react'
import styles from './PromoCodeForm.module.scss'

export default function PromoCodeForm() {
  const [code, setCode] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // No-op placeholder. Wire to a real promo-code action later.
  }

  return (
    <form className={styles.root} onSubmit={handleSubmit}>
      <label htmlFor='cart-promo' className={styles.label}>
        Промокод
      </label>
      <div className={styles.controls}>
        <input
          id='cart-promo'
          type='text'
          autoComplete='off'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className={styles.input}
        />
        <button type='submit' className={styles.button}>
          Применить
        </button>
      </div>
    </form>
  )
}
