// Client-safe runtime exports.
//
// Server-only functions (placeOrder, getDownloadUrl) live in their own files
// and are imported directly from src/lib/orders/actions.ts — re-exporting
// them here would pull `next/headers` into the client bundle.
export { getOrders, getOrderHistory, ordersQueryKey, orderHistoryQueryKey } from './getOrders'
export { getBoxSetPhysicalFlags, boxSetPhysicalFlagsQueryKey } from './getBoxSetPhysicalFlags'

// Types are erased at runtime, safe to re-export from anywhere.
export type { PlaceOrderInput, PlaceOrderResult, PlaceOrderErrorReason } from './placeOrder'
export type { DownloadUrlResult } from './getDownloadUrl'
