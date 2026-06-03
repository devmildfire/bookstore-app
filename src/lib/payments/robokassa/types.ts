// Shared Robokassa request/callback shapes.

/** Custom Shp_* params we round-trip through Robokassa (echoed on callbacks). */
export type ShpParams = Record<string, string | number>

/** Descriptor the client uses to POST the buyer to the gateway. */
export type PaymentRedirect = {
  url: string
  method: 'POST'
  fields: Record<string, string>
}

/** Parsed + verified ResultURL / SuccessURL callback. */
export type VerifiedCallback =
  | { valid: true; invId: number; outSum: string; shp: ShpParams }
  | { valid: false; reason: 'missing_params' | 'bad_signature' }

export type RecurringChargeInput = {
  /** The new invoice (order) id for this period's charge. */
  invId: number
  /** The anchor invoice id from the initial Recurring=true payment. */
  previousInvId: number
  /** Amount to charge this period. */
  amount: number
}

export type RecurringChargeResult =
  | { status: 'ok' }
  | { status: 'error'; message: string }
