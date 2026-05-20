'use server'

import { placeOrder } from '@/api/orders/placeOrder'
import { getDownloadUrl } from '@/api/orders/getDownloadUrl'
import { setRecoveryEmail } from '@/api/orders/setRecoveryEmail'
import type {
  PlaceOrderInput,
  PlaceOrderResult,
  DownloadUrlResult,
  SetRecoveryEmailResult,
} from '@/api/orders'

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return placeOrder(input)
}

export async function getDownloadUrlAction(orderItemId: number): Promise<DownloadUrlResult> {
  return getDownloadUrl(orderItemId)
}

export async function setRecoveryEmailAction(email: string): Promise<SetRecoveryEmailResult> {
  const trimmed = email.trim()
  if (!trimmed) {
    return { status: 'error', message: 'Введите email' }
  }
  return setRecoveryEmail(trimmed)
}
