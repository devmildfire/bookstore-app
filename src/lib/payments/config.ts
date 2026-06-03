import 'server-only'

// Robokassa payment configuration. Holds the merchant credentials and the
// resolved gateway URLs. The ONLY difference between the local stand-in and
// production Robokassa is `provider` (which flips the payment + recurring base
// URLs to our own mock endpoints) and which credentials are loaded — every
// signature and every callback handler is identical. Going live = set
// PAYMENT_PROVIDER=robokassa and fill in the real passwords.
//
// Passwords live here, so this module is server-only.

export type PaymentProvider = 'mock' | 'robokassa'
export type HashAlgo = 'md5' | 'sha256' | 'sha384' | 'sha512'

const ROBOKASSA_PROD_BASE = 'https://auth.robokassa.ru'

export type PaymentConfig = {
  provider: PaymentProvider
  merchantLogin: string
  password1: string
  password2: string
  isTest: boolean
  hashAlgo: HashAlgo
  /** Our public origin — base for the absolute Result/Success/Fail URLs. */
  siteUrl: string
  /** Where the buyer is sent to start a payment (mock page vs Robokassa). */
  paymentInitUrl: string
  /** Server-to-server endpoint for merchant-initiated recurring charges. */
  recurringUrl: string
  /** Server→server webhook Robokassa (or the mock) calls to confirm payment. */
  resultUrl: string
  /** Browser redirect after a successful payment. */
  successUrl: string
  /** Browser redirect after a cancelled/failed payment. */
  failUrl: string
  /** Shared secret required by the recurring cron route. */
  cronSecret: string
}

function readProvider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === 'robokassa' ? 'robokassa' : 'mock'
}

function readAlgo(): HashAlgo {
  const a = (process.env.ROBOKASSA_HASH_ALGO ?? 'md5').toLowerCase()
  return a === 'sha256' || a === 'sha384' || a === 'sha512' ? a : 'md5'
}

export function getPaymentConfig(): PaymentConfig {
  const provider = readProvider()
  const siteUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  // In mock mode the buyer is redirected to our own stand-in page; in prod to
  // Robokassa's hosted form. The recurring charge target mirrors this split.
  const paymentInitUrl =
    provider === 'mock'
      ? `${siteUrl}/api/payments/mock/gateway`
      : `${ROBOKASSA_PROD_BASE}/Merchant/Index.aspx`
  const recurringUrl =
    provider === 'mock'
      ? `${siteUrl}/api/payments/mock/recurring`
      : `${ROBOKASSA_PROD_BASE}/Merchant/Recurring`

  return {
    provider,
    merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN ?? 'chtivo_demo',
    password1: process.env.ROBOKASSA_PASSWORD_1 ?? 'mock_password_1',
    password2: process.env.ROBOKASSA_PASSWORD_2 ?? 'mock_password_2',
    isTest: process.env.ROBOKASSA_IS_TEST === '1' || provider === 'mock',
    hashAlgo: readAlgo(),
    siteUrl,
    paymentInitUrl,
    recurringUrl,
    // These callbacks are configured in the Robokassa dashboard for production;
    // the mock gateway reads them from here to call back into the same handlers.
    resultUrl: `${siteUrl}/api/payments/robokassa/result`,
    successUrl: `${siteUrl}/payments/success`,
    failUrl: `${siteUrl}/payments/fail`,
    cronSecret: process.env.PAYMENT_CRON_SECRET ?? 'mock_cron_secret',
  }
}

export function isMockProvider(): boolean {
  return readProvider() === 'mock'
}
