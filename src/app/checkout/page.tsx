'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/contexts/cart'
import CartItemRow from '@/components/cart/CartItemRow'
import Button from '@/components/common/Button'
import { createOrder } from '@/api/orders'
import styles from './page.module.scss'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, itemCount, updateQuantity, removeItem, clearItems } = useCart()
  const [step, setStep] = useState<'review' | 'payment' | 'processing'>('review')
  const [deliveryEmail, setDeliveryEmail] = useState('')
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'email'>('download')
  const [error, setError] = useState<string | null>(null)

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

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const { orderId } = await createOrder(items, deliveryMethod === 'email' ? deliveryEmail : undefined)
      await clearItems()

      const params = new URLSearchParams({
        orderId: String(orderId),
        delivery: deliveryMethod,
      })
      if (deliveryEmail) params.set('email', deliveryEmail)

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
        <div className={`${styles.step} ${step === 'review' ? styles.active : styles.done}`}>
          1. Заказ
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step === 'payment' || step === 'processing' ? styles.active : ''}`}>
          2. Оплата
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step === 'processing' ? styles.active : ''}`}>
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
              <div className={styles.deliveryOptions}>
                <label className={styles.radio}>
                  <input
                    type='radio'
                    name='delivery'
                    value='download'
                    checked={deliveryMethod === 'download'}
                    onChange={() => setDeliveryMethod('download')}
                  />
                  <span>Скачать после оплаты</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type='radio'
                    name='delivery'
                    value='email'
                    checked={deliveryMethod === 'email'}
                    onChange={() => setDeliveryMethod('email')}
                  />
                  <span>Отправить на email</span>
                </label>
              </div>

              {deliveryMethod === 'email' && (
                <input
                  type='email'
                  placeholder='Ваш email'
                  value={deliveryEmail}
                  onChange={(e) => setDeliveryEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                />
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

              <Button
                variant='primary'
                size='lg'
                className={styles.payBtn}
                onClick={() => setStep('payment')}
              >
                Перейти к оплате
              </Button>
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
