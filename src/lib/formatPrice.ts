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
