/**
 * Format a numeric price as a Russian-style currency string with no space
 * before the ruble sign — e.g. `1234` → `"1 234₽"`.
 *
 * Differs from `Intl.NumberFormat(..., { style: 'currency' })` which inserts
 * a non-breaking space between the number and `₽`. The cart designs render
 * the ruble glyph glued to the digits, so we use a tiny custom formatter.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount)
  const grouped = rounded.toLocaleString('ru-RU')
  return `${grouped}₽`
}

// Shown in place of a 0₽ price for free products — they are "priceless", not free-of-charge.
export const FREE_PRICE_LABEL = 'Бесценно'

/**
 * Format a *product's* price for display. A price of 0 (or less) renders as
 * `Бесценно` instead of `0₽`. Use this anywhere a product/edition/box-set/
 * subscription price is shown to a buyer. Do NOT use it for totals, discounts,
 * gift-card balances, or amount-due — a computed 0 there is genuinely zero, not
 * "priceless" (use `formatPrice` for those).
 */
export function formatProductPrice(amount: number): string {
  return amount <= 0 ? FREE_PRICE_LABEL : formatPrice(amount)
}
