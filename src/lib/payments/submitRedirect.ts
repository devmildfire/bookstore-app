import type { PaymentRedirect } from './robokassa/types'

// Hand the browser off to the payment gateway via a full-page auto-submitting
// POST. Shared by the checkout page and the order-history "resume payment"
// action — both build a PaymentRedirect server-side and POST it from the client.
export function submitPaymentRedirect(redirect: PaymentRedirect): void {
  const form = document.createElement('form')
  form.method = redirect.method
  form.action = redirect.url
  for (const [name, value] of Object.entries(redirect.fields)) {
    const field = document.createElement('input')
    field.type = 'hidden'
    field.name = name
    field.value = value
    form.appendChild(field)
  }
  document.body.appendChild(form)
  form.submit()
}
