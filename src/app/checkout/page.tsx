'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import cn from 'classnames'
import Link from 'next/link'
import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/common/Button'
import { createOrderAction } from '@/lib/orders/actions'
import styles from './page.module.scss'

const deliverySchema = z.object({
  method: z.enum(['download', 'email']),
  email: z.string(),
}).superRefine((val, ctx) => {
  if (val.method === 'email' && !z.string().email().safeParse(val.email).success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Введите корректный email', path: ['email'] })
  }
})

type DeliveryValues = z.infer<typeof deliverySchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, itemCount, updateQuantity, removeItem, clearItems } = useCart()
  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review')
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, control, getValues, formState: { errors } } = useForm<DeliveryValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { method: 'download', email: '' },
  })

  const deliveryMethod = useWatch({ control, name: 'method' })

  const totalFormatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(total)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Корзина пуста</h1>
        <p>Добавьте книги из каталога для оформления заказа.</p>
        <Link href='/books'>
          <Button variant='primary'>Перейти в каталог</Button>
        </Link>
      </div>
    )
  }

  const handlePayment = async () => {
    setStep('processing')
    setError(null)
    const { method, email } = getValues()

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const result = await createOrderAction(method === 'email' ? email : undefined)
      if ('error' in result) throw new Error(result.error)
      const { orderId } = result
      await clearItems()

      const params = new URLSearchParams({ orderId: String(orderId), delivery: method })
      if (method === 'email' && email) params.set('email', email)

      router.push(`/checkout/success?${params.toString()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при оформлении заказа')
      setStep('payment')
    }
  }

  return (
    <div className={styles.page}>
      <h1>Оформление заказа</h1>

      {/* Step indicator */}
      <div className={styles.steps}>
        <div className={cn(styles.step, step === 'review' ? styles.active : styles.done)}>
          1. Заказ
        </div>
        <div className={styles.stepLine} />
        <div className={cn(styles.step, (step === 'payment' || step === 'processing') && styles.active)}>
          2. Оплата
        </div>
        <div className={styles.stepLine} />
        <div className={cn(styles.step, step === 'processing' && styles.active)}>
          3. Доставка
        </div>
      </div>

      {step === 'review' && (
        <div className={styles.content}>
          <div className={styles.itemsSection}>
            <h2 className={styles.sectionTitle}>Товары ({itemCount})</h2>
            <div className={styles.items}>
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </div>

          <div className={styles.summary}>
            <h2 className={styles.sectionTitle}>Доставка</h2>
            <div className={styles.summaryCard}>
              <form onSubmit={handleSubmit(() => setStep('payment'))}>
                <div className={styles.deliveryOptions}>
                  <label className={styles.radio}>
                    <input type='radio' value='download' {...register('method')} />
                    <span>Скачать после оплаты</span>
                  </label>
                  <label className={styles.radio}>
                    <input type='radio' value='email' {...register('method')} />
                    <span>Отправить на email</span>
                  </label>
                </div>

                {deliveryMethod === 'email' && (
                  <div className={styles.emailField}>
                    <input
                      type='email'
                      placeholder='Ваш email'
                      {...register('email')}
                      className={styles.emailInput}
                    />
                    {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
                  </div>
                )}

                <div className={styles.divider} />

                <div className={styles.summaryRow}>
                  <span>Товары ({itemCount})</span>
                  <span>{totalFormatted}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.totalLabel}>К оплате</span>
                  <span className={styles.totalPrice}>{totalFormatted}</span>
                </div>

                <Button type='submit' variant='primary' size='lg' className={styles.payBtn}>
                  Перейти к оплате
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {step === 'payment' && (
        <div className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Оплата</h2>
          <div className={styles.paymentCard}>
            <p className={styles.paymentInfo}>
              Сумма к оплате: <strong>{totalFormatted}</strong>
            </p>
            <p className={styles.paymentHint}>
              Демо-режим. Нажмите «Оплатить» для симуляции успешного платежа.
            </p>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.paymentActions}>
              <Button variant='secondary' onClick={() => setStep('review')}>
                Назад
              </Button>
              <Button variant='primary' size='lg' onClick={handlePayment}>
                Оплатить {totalFormatted}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <p>Обработка платежа...</p>
        </div>
      )}
    </div>
  )
}
