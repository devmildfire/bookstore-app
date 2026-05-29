'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCart } from '@/contexts/cart'
import { getProfile, profileQueryKey } from '@/api/profile'
import useSupabaseUser from '@/hooks/useSupabaseUser'
import DeliveryForm from '@/components/checkout/DeliveryForm'
import EmailOnlyForm from '@/components/checkout/EmailOnlyForm'
import GiftCardPicker, { type SelectedGiftCardPayment } from '@/components/checkout/GiftCardPicker'
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
  const { items, finalTotal, giftCardEligibleTotal, appliedPromo, hasPhysicalItems } = useCart()
  const { data: profile } = useQuery({ queryKey: profileQueryKey, queryFn: getProfile })
  const { isAnonymous } = useSupabaseUser()
  const [pending, setPending] = useState<PendingOrder | null>(null)
  const [modalState, setModalState] = useState<PaymentModalState>({ kind: 'idle' })
  const [selectedGiftCards, setSelectedGiftCards] = useState<SelectedGiftCardPayment[]>([])

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
	        giftCards: selectedGiftCards,
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
	        giftCards: selectedGiftCards,
      },
      shippingSummary: null,
    })
    setModalState({ kind: 'idle' })
  }

  async function handleConfirm() {
    if (!pending) return
    setModalState({ kind: 'processing' })

    const orderGiftCards = pending.input.giftCards ?? []
    const amountDue = Math.max(0, finalTotal - orderGiftCards.reduce((sum, card) => sum + card.amount, 0))
    const tasks: Array<Promise<unknown>> = [placeOrderAction(pending.input)]
    if (amountDue > 0) tasks.push(new Promise((r) => setTimeout(r, 1500)))
    const [result] = (await Promise.all(tasks)) as [Awaited<ReturnType<typeof placeOrderAction>>, ...unknown[]]

    if (result.status === 'ok') {
      router.push(`/profile/orders?from=checkout&order=${result.orderId}`)
      return
    }

	    const reasons: Record<string, string> = {
	      not_authenticated: 'Нужно войти, чтобы оформить заказ.',
	      empty_cart: 'Корзина пуста.',
	      invalid_gift_cards: 'Не удалось применить выбранные карты даров.',
	      gift_card_over_limit: 'Сумма по картам даров превышает доступный лимит.',
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
  const giftCardAppliedTotal = selectedGiftCards.reduce((sum, card) => sum + card.amount, 0)
  const amountDue = Math.max(0, finalTotal - giftCardAppliedTotal)

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{hasPhysicalItems ? 'Доставка' : 'Оформление'}</h1>

      <GiftCardPicker
        eligibleTotal={Math.min(giftCardEligibleTotal, finalTotal)}
        onChange={setSelectedGiftCards}
      />

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
          isAnonymous={isAnonymous}
        />
      )}

      <PaymentConfirmModal
        open={pending !== null}
        state={modalState}
        amount={amountDue}
        isFullyCovered={amountDue === 0}
        appliedCode={appliedPromo?.code ?? null}
        summary={pending?.shippingSummary ?? null}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
    </div>
  )
}
