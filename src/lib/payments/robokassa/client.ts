import { getPaymentConfig } from '../config'
import {
  formatOutSum,
  initSignature,
  recurringSignature,
  resultSignature,
  successSignature,
  signaturesMatch,
} from './signature'
import { buildReceipt } from './receipt'
import type {
  PaymentRedirect,
  RecurringChargeInput,
  RecurringChargeResult,
  ShpParams,
  VerifiedCallback,
} from './types'

// High-level Robokassa client. Builds signed payment requests, verifies the
// ResultURL/SuccessURL callbacks, and fires merchant-initiated recurring
// charges. Provider-agnostic: the mock and real Robokassa differ only in the
// resolved base URLs + credentials (see config.ts).

export type InitPaymentInput = {
  /** Invoice (order) id → Robokassa InvId. */
  invId: number
  /** Amount the gateway should charge. */
  amount: number
  description: string
  email?: string | null
  /** Flag the initial payment as the anchor for future recurring charges. */
  recurring?: boolean
  /** Custom Shp_* params echoed back on the callbacks. */
  shp?: ShpParams
}

/** Build the auto-submitting POST the buyer is sent to (mock page or Robokassa). */
export function buildInitRedirect(input: InitPaymentInput): PaymentRedirect {
  const cfg = getPaymentConfig()
  const outSum = formatOutSum(input.amount)
  const receipt = buildReceipt([]) // stub → undefined (no Receipt sent yet)

  const signature = initSignature({
    merchantLogin: cfg.merchantLogin,
    outSum,
    invId: input.invId,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
    receipt,
    shp: input.shp,
  })

  const fields: Record<string, string> = {
    MerchantLogin: cfg.merchantLogin,
    OutSum: outSum,
    InvId: String(input.invId),
    Description: input.description,
    SignatureValue: signature,
    Culture: 'ru',
    Encoding: 'utf-8',
  }
  if (receipt) fields.Receipt = receipt
  if (cfg.isTest) fields.IsTest = '1'
  if (input.email) fields.Email = input.email
  if (input.recurring) fields.Recurring = 'true'
  for (const [k, v] of Object.entries(input.shp ?? {})) {
    if (k.startsWith('Shp_')) fields[k] = String(v)
  }

  return { url: cfg.paymentInitUrl, method: 'POST', fields }
}

// Pull Shp_* params out of a callback param bag (case-sensitive prefix).
function extractShp(get: (key: string) => string | null, keys: string[]): ShpParams {
  const shp: ShpParams = {}
  for (const k of keys) {
    if (k.startsWith('Shp_')) shp[k] = get(k) ?? ''
  }
  return shp
}

function paramsAccessor(params: URLSearchParams | Record<string, string>) {
  if (params instanceof URLSearchParams) {
    return { get: (k: string) => params.get(k), keys: Array.from(params.keys()) }
  }
  return { get: (k: string) => params[k] ?? null, keys: Object.keys(params) }
}

/** Verify a ResultURL callback (Password2). */
export function parseAndVerifyResult(
  params: URLSearchParams | Record<string, string>
): VerifiedCallback {
  const cfg = getPaymentConfig()
  const { get, keys } = paramsAccessor(params)
  const outSum = get('OutSum')
  const invIdRaw = get('InvId')
  const received = get('SignatureValue')
  if (!outSum || !invIdRaw || !received) {
    return { valid: false, reason: 'missing_params' }
  }
  const shp = extractShp(get, keys)
  const expected = resultSignature({
    outSum,
    invId: invIdRaw,
    password2: cfg.password2,
    algo: cfg.hashAlgo,
    shp,
  })
  if (!signaturesMatch(received, expected)) {
    return { valid: false, reason: 'bad_signature' }
  }
  return { valid: true, invId: Number(invIdRaw), outSum, shp }
}

/** Verify a SuccessURL redirect (Password1). */
export function parseAndVerifySuccess(
  params: URLSearchParams | Record<string, string>
): VerifiedCallback {
  const cfg = getPaymentConfig()
  const { get, keys } = paramsAccessor(params)
  const outSum = get('OutSum')
  const invIdRaw = get('InvId')
  const received = get('SignatureValue')
  if (!outSum || !invIdRaw || !received) {
    return { valid: false, reason: 'missing_params' }
  }
  const shp = extractShp(get, keys)
  const expected = successSignature({
    outSum,
    invId: invIdRaw,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
    shp,
  })
  if (!signaturesMatch(received, expected)) {
    return { valid: false, reason: 'bad_signature' }
  }
  return { valid: true, invId: Number(invIdRaw), outSum, shp }
}

/** The exact body Robokassa expects from our ResultURL: literal "OK{InvId}". */
export function buildResultResponse(invId: number | string): string {
  return `OK${invId}`
}

/**
 * Fire a merchant-initiated recurring charge. POSTs to Robokassa's
 * /Merchant/Recurring (or the mock equivalent). Robokassa then notifies our
 * ResultURL exactly like a one-time payment; success here only means accepted.
 */
export async function chargeRecurring(input: RecurringChargeInput): Promise<RecurringChargeResult> {
  const cfg = getPaymentConfig()
  const outSum = formatOutSum(input.amount)
  const signature = recurringSignature({
    merchantLogin: cfg.merchantLogin,
    outSum,
    invId: input.invId,
    password1: cfg.password1,
    algo: cfg.hashAlgo,
  })

  const body = new URLSearchParams({
    MerchantLogin: cfg.merchantLogin,
    InvId: String(input.invId),
    PreviousInvoiceID: String(input.previousInvId),
    OutSum: outSum,
    SignatureValue: signature,
  })

  try {
    const res = await fetch(cfg.recurringUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const text = (await res.text()).trim()
    if (!res.ok || !text.toUpperCase().startsWith('OK')) {
      return { status: 'error', message: text || `HTTP ${res.status}` }
    }
    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'network_error' }
  }
}
