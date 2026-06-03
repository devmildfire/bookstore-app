import { createHash } from 'node:crypto'
import type { HashAlgo } from '../config'

// Robokassa signature ("SignatureValue") formulas. These are the exact strings
// Robokassa hashes — replicated so our stand-in produces/validates identical
// signatures and the production swap needs no change here.
//
//   init     = HASH( MerchantLogin:OutSum:InvId[:Receipt]:Password1 [:Shp_…] )
//   recurring= same as init (uses Password1; PreviousInvoiceID is NOT signed)
//   result   = HASH( OutSum:InvId:Password2 [:Shp_…] )      ← ResultURL webhook
//   success  = HASH( OutSum:InvId:Password1 [:Shp_…] )      ← SuccessURL redirect
//
// Custom Shp_* params are appended sorted alphabetically as ":Shp_key=value".
// Comparison is case-insensitive (Robokassa returns upper-case hex).

export type ShpParams = Record<string, string | number>

function hash(algo: HashAlgo, input: string): string {
  return createHash(algo).update(input, 'utf8').digest('hex')
}

// ":Shp_a=1:Shp_b=2", keys sorted; only keys with the Shp_ prefix are signed.
function shpSuffix(shp?: ShpParams): string {
  if (!shp) return ''
  return Object.keys(shp)
    .filter((k) => k.startsWith('Shp_'))
    .sort()
    .map((k) => `:${k}=${shp[k]}`)
    .join('')
}

/** Robokassa wants the amount as a plain decimal with a dot, two places. */
export function formatOutSum(amount: number): string {
  return amount.toFixed(2)
}

export function initSignature(p: {
  merchantLogin: string
  outSum: string
  invId: number | string
  password1: string
  algo: HashAlgo
  /** Exactly the string sent as the Receipt param, if any. */
  receipt?: string
  shp?: ShpParams
}): string {
  const parts = [p.merchantLogin, p.outSum, String(p.invId)]
  if (p.receipt) parts.push(p.receipt)
  parts.push(p.password1)
  return hash(p.algo, parts.join(':') + shpSuffix(p.shp))
}

/** Merchant-initiated recurring charge — identical formula to the init payment. */
export const recurringSignature = initSignature

export function resultSignature(p: {
  outSum: string
  invId: number | string
  password2: string
  algo: HashAlgo
  shp?: ShpParams
}): string {
  return hash(p.algo, `${p.outSum}:${p.invId}:${p.password2}` + shpSuffix(p.shp))
}

export function successSignature(p: {
  outSum: string
  invId: number | string
  password1: string
  algo: HashAlgo
  shp?: ShpParams
}): string {
  return hash(p.algo, `${p.outSum}:${p.invId}:${p.password1}` + shpSuffix(p.shp))
}

/** Case-insensitive hex compare — Robokassa may send upper- or lower-case. */
export function signaturesMatch(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
