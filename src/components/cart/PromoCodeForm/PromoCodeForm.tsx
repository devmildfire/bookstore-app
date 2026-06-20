'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/cart'
import Input from '@/components/common/Input'
import type { ApplyPromoErrorReason } from '@/api/promo/applyPromoCode'
import styles from './PromoCodeForm.module.scss'

const ERROR_LABELS: Record<ApplyPromoErrorReason, string> = {
  invalid_input: 'Введите корректный промокод',
  not_authenticated: 'Нужно войти в аккаунт',
  not_found: 'Промокод не найден',
  inactive: 'Промокод неактивен или истёк',
  target_missing: '', // resolved with targetName at render time
}

export default function PromoCodeForm() {
  const { appliedPromo, applyPromo, removePromo, isPending } = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const result = await applyPromo(code)

    if (result.status === 'ok') {
      setCode('')
      return
    }

    if (result.reason === 'target_missing') {
      const target = result.targetName ?? 'определённой книге'
      setError(`Промокод применим только к «${target}». Добавьте товар в корзину.`)
      return
    }

    setError(ERROR_LABELS[result.reason])
  }

  return (
    <div className={styles.root}>
      {appliedPromo ? (
        <div className={styles.chip}>
          <span className={styles.chipLabel}>Применён:</span>
          <span className={styles.chipCode}>{appliedPromo.code}</span>
          <span className={styles.chipPct}>−{appliedPromo.discountPct}%</span>
          <button
            type='button'
            className={styles.chipRemove}
            onClick={() => removePromo()}
            disabled={isPending}
            aria-label='Убрать промокод'
          >
            <span aria-hidden>✕</span>
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor='cart-promo' className={styles.label}>
            Промокод
          </label>
          <div className={styles.controls}>
            <Input
              id='cart-promo'
              type='text'
              autoComplete='off'
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                if (error) setError(null)
              }}
              className={styles.input}
              disabled={isPending}
            />
            <button type='submit' className={styles.button} disabled={isPending || !code.trim()}>
              Применить
            </button>
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      )}
    </div>
  )
}
