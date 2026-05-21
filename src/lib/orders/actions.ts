'use server'

import { placeOrder } from '@/api/orders/placeOrder'
import { getDownloadUrl } from '@/api/orders/getDownloadUrl'
import type {
  PlaceOrderInput,
  PlaceOrderResult,
  DownloadUrlResult,
} from '@/api/orders'

export async function placeOrderAction(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  return placeOrder(input)
}

export async function getDownloadUrlAction(orderItemId: number): Promise<DownloadUrlResult> {
  return getDownloadUrl(orderItemId)
}
