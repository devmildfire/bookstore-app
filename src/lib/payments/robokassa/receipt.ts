// Robokassa fiscalization (54-ФЗ) receipt. TYPED STUB for now: `buildReceipt`
// returns undefined, so no Receipt param is sent and it's excluded from the
// signature. When fiscalization is enabled, map cart/order lines here and the
// signer will pick it up automatically (see initSignature's `receipt` arg).

/** Tax codes accepted by Robokassa's `tax` field. */
export type RobokassaTax = 'none' | 'vat0' | 'vat10' | 'vat20' | 'vat110' | 'vat120'

/** Payment object / method per 54-ФЗ — narrowed to what we'd use. */
export type RobokassaPaymentMethod =
  | 'full_prepayment'
  | 'prepayment'
  | 'advance'
  | 'full_payment'
export type RobokassaPaymentObject = 'commodity' | 'service' | 'payment'

export type RobokassaReceiptItem = {
  name: string
  quantity: number
  sum: number
  tax: RobokassaTax
  payment_method?: RobokassaPaymentMethod
  payment_object?: RobokassaPaymentObject
}

export type RobokassaReceipt = {
  /** Tax system; omit to use the shop default configured in Robokassa. */
  sno?: 'osn' | 'usn_income' | 'usn_income_outcome' | 'patent' | 'envd' | 'esn'
  items: RobokassaReceiptItem[]
}

export type ReceiptOrderLine = {
  name: string
  price: number
  quantity: number
}

/**
 * Build the URL-encoded Receipt JSON for the signed request.
 *
 * STUB — returns undefined so no Receipt is sent yet. To enable fiscalization,
 * map `lines` to RobokassaReceiptItem[] (default tax, payment_object) and return
 * `encodeURIComponent(JSON.stringify(receipt))`. The same string must be fed to
 * `initSignature({ receipt })`.
 */
export function buildReceipt(_lines: ReceiptOrderLine[]): string | undefined {
  void _lines
  return undefined
}
