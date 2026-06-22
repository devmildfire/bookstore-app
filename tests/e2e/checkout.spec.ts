import { test, expect } from '@playwright/test'

// Full digital checkout journey through the mock gateway (PAYMENT_PROVIDER=mock):
// book → add the e-book edition → cart → checkout (email-only) → confirm →
// pay on the mock gateway → land on the orders page with the order paid.
// "white-flower" (title 58) has an EBook edition, so checkout takes the
// digital/email-only path (no shipping form). See docs/testing/STRATEGY.md §3.
test('digital checkout: add to cart → mock pay → order is paid', async ({ page }) => {
  // A multi-page journey across several routes the dev server compiles on first
  // hit — well past the 30s default.
  test.setTimeout(120_000)
  // 1+2 — Add the e-book edition and confirm it reached the cart. The whole
  // book→add→cart is retried: the add writes to the anon user's cart, and the
  // anonymous sign-in runs asynchronously on load, so an early click (or a
  // dropped one) can no-op. The digital edition caps at qty 1, so re-adding is
  // safe. Done when /cart shows the checkout CTA (it only renders with items).
  const continueCta = page.getByRole('link', { name: 'Продолжить' })
  await expect(async () => {
    await page.goto('/books/white-flower')
    await page.locator('#tab-EBook').click()
    const addBtn = page.locator('#edition-panel').getByRole('button', { name: /корзин/i })
    await expect(addBtn).toBeEnabled()
    await addBtn.click()
    await page.goto('/cart')
    await expect(continueCta).toBeVisible({ timeout: 3000 })
  }).toPass({ timeout: 40_000 })

  // 3 — Checkout (digital cart → email-only form). Navigate client-side via
  // «Продолжить»: a full goto remounts CheckoutView with a momentarily-empty
  // cart context, whose effect bounces back to /cart. Retry the Link click to
  // ride out the App Router hydration window.
  const payCta = page.getByRole('button', { name: 'Перейти к оплате' })
  await expect(async () => {
    if (!page.url().includes('/checkout')) await continueCta.click()
    await expect(payCta).toBeVisible({ timeout: 3000 })
  }).toPass({ timeout: 20_000 })

  // 4 — Submit the email form to open the confirmation modal, then confirm.
  // Retry the submit through the hydration window (re-click only while closed).
  const confirmBtn = page.getByRole('button', { name: /Подтвердить оплату|Оформить заказ/ })
  await expect(async () => {
    if (!(await confirmBtn.isVisible())) await payCta.click()
    await expect(confirmBtn).toBeVisible({ timeout: 2000 })
  }).toPass({ timeout: 20_000 })
  await confirmBtn.click()

  // 5 — Mock gateway: a native server-rendered form, so a single click submits
  // reliably. Then wait out the redirect chain (pay → ResultURL → success →
  // orders), which cold-compiles three routes in dev — give it room.
  await page.waitForURL(/\/payments\/mock/, { timeout: 30_000 })
  await page.getByRole('button', { name: /^Оплатить/ }).click()
  await page.waitForURL(/\/profile\/orders/, { timeout: 45_000 })

  // 6 — The order settled as paid.
  await expect(page.getByText('Оплачен').first()).toBeVisible({ timeout: 10_000 })
})
