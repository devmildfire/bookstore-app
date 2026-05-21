'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '@/contexts/cart'
import { getProfile, profileQueryKey } from '@/api/profile'
import DeliveryForm from '@/components/checkout/DeliveryForm'
import EmailOnlyForm from '@/components/checkout/EmailOnlyForm'
import PaymentConfirmModal, {
  type PaymentModalState,
} from '@/components/checkout/PaymentConfirmModal'
import { placeOrderAction } from '@/lib/orders/actions'
import type {
  EmailOnlyFormValues,
  ShippingFormValues,
} from '@/entities/order/validation'
import type { PlaceOrderInput } from '@/api/orders'
import styles from './page.module.scss'

type PendingOrder = {
  input: PlaceOrderInput
  shippingSummary: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, finalTotal, appliedPromo, hasPhysicalItems } = useCart()
  const { data: profile } = useQuery({ queryKey: profileQueryKey, queryFn: getProfile })
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [modalState, setModalState] = useState<PaymentModalState>({ kind: 'idle' })

  useEffect(() => {
    if (items.length === 0) router.replace('/cart')
  }, [items.length, router])

  function buildShippingSummary(values: ShippingFormValues): string {
    const addressParts = [values.city, values.street, values.building, values.postalCode]
      .filter((p): p is string => Boolean(p))
      .join(', ')
    const recipient = values.name ?? ''
    return recipient ? `Доставка: ${recipient}, ${addressParts}` : `Доставка: ${addressParts}`
  }

  function handleDeliverySubmit(values: ShippingFormValues) {
    setPending({
      input: {
        shippingName: values.name ?? null,
        shippingPhone: values.phone ?? null,
        shippingCity: values.city,
        shippingStreet: values.street,
        shippingBuilding: values.building,
        shippingPostalCode: values.postalCode,
        email: values.email ?? null,
      },
      shippingSummary: buildShippingSummary(values),
    })
    setModalState({ kind: 'idle' })
  }

  function handleEmailSubmit(values: EmailOnlyFormValues) {
    setPending({
      input: {
        shippingName: null,
        shippingPhone: null,
        shippingCity: null,
        shippingStreet: null,
        shippingBuilding: null,
        shippingPostalCode: null,
        email: values.email ?? null,
      },
      shippingSummary: null,
    })
    setModalState({ kind: 'idle' })
  }

  async function handleConfirm() {
    if (!pending) return
    setModalState({ kind: 'processing' })

    // Run the Server Action and a visual delay in parallel; redirect only
    // when both resolve. Keeps the spinner visible long enough to feel
    // intentional and prevents flicker when the RPC returns instantly.
    const [result] = await Promise.all([
      placeOrderAction(pending.input),
      new Promise((r) => setTimeout(r, 1500)),
    ])

    if (result.status === 'ok') {
      router.push(`/profile?from=checkout&order=${result.orderId}`)
      return
    }

    const reasons: Record<string, string> = {
      not_authenticated: 'Нужно войти, чтобы оформить заказ.',
      empty_cart: 'Корзина пуста.',
      unknown: result.message ?? 'Не удалось оформить заказ.',
    }
    setModalState({
      kind: 'error',
      message: reasons[result.reason] ?? 'Не удалось оформить заказ.',
    })
  }

  function handleCloseModal() {
    setPending(null)
    setModalState({ kind: 'idle' })
  }

  const isPending = modalState.kind === 'processing'

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{hasPhysicalItems ? 'Доставка' : 'Оформление'}</h1>

      {hasPhysicalItems ? (
        <DeliveryForm
          onSubmit={handleDeliverySubmit}
          isPending={isPending}
          defaults={{
            name: profile?.fullName,
            phone: profile?.phone,
            email: profile?.recoveryEmail,
          }}
        />
      ) : (
        <EmailOnlyForm
          onSubmit={handleEmailSubmit}
          isPending={isPending}
          defaultEmail={profile?.recoveryEmail}
        />
      )}

      <PaymentConfirmModal
        open={pending !== null}
        state={modalState}
        amount={finalTotal}
        appliedCode={appliedPromo?.code ?? null}
        summary={pending?.shippingSummary ?? null}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </div>
  )
}
