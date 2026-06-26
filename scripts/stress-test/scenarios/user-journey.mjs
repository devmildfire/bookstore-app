import { readInp, measureNavigation } from '../lib/cwv.mjs'

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const jitter = (page, min, max) => page.waitForTimeout(rand(min, max))

async function scrollPage(page, steps) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7)).catch(() => {})
    await jitter(page, 500, 1500)
  }
}

export async function runJourney(session, { url, reporter }) {
  const { page } = session
  const s = (step, action, extra = {}) =>
    reporter.record({ sessionId: session.id, deviceType: session.deviceType, timestamp: new Date().toISOString(), step, action, ...extra })

  // Navigate + measure CWV (records pending-page INP first, before leaving it).
  async function nav(path) {
    const inp = await readInp(page)
    if (inp) s('inp', `inp_pre_${path}`, { inp })
    const { durationMs, cwv } = await measureNavigation(page, `${url}${path}`)
    s('navigate', `goto ${path}`, { durationMs, ok: true, ...(cwv ? { cwv } : {}) })
  }

  // Playwright locators auto-wait + scroll into view + dispatch a real click
  // (so INP gets an interactionId). Returns false if the step failed.
  async function click(locator, action) {
    const start = Date.now()
    try {
      await locator.click({ timeout: 8000 })
      s('click', action, { durationMs: Date.now() - start, ok: true })
      await jitter(page, 1000, 3000)
      return true
    } catch (e) {
      s('click', action, { durationMs: Date.now() - start, ok: false, error: e.message })
      return false
    }
  }

  // Warmup: open the TCP/TLS connection without caching LCP resources, so the
  // first real navigation's LCP/FCP aren't skewed by a warm cache.
  await page.goto(`${url}/robots.txt`, { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(500)

  await nav('/')
  await scrollPage(page, rand(2, 3))

  // Open 1–3 books and add each to the cart.
  const itemsToAdd = rand(1, 3)
  for (let i = 0; i < itemsToAdd; i++) {
    await nav('/')
    await scrollPage(page, rand(1, 2))
    const hrefs = await page
      .evaluate(() =>
        Array.from(document.querySelectorAll('a[href*="/books/"]'))
          .filter((a) => /BookCard|Slider/.test(a.parentElement?.className || '') && !a.href.includes('#'))
          .map((a) => a.href),
      )
      .catch(() => [])
    if (!hrefs.length) { s('open_detail', `book ${i + 1}`, { ok: false, error: 'no book links found' }); continue }

    const { durationMs, cwv } = await measureNavigation(page, hrefs[rand(0, hrefs.length - 1)])
    s('open_detail', `book ${i + 1}`, { durationMs, ok: true, ...(cwv ? { cwv } : {}) })
    await scrollPage(page, rand(2, 3))
    await click(page.getByRole('button', { name: 'Добавить в корзину' }).first(), `add_to_cart ${i + 1}`)
  }

  // Cart → checkout.
  await nav('/cart')
  await scrollPage(page, rand(1, 2))
  if (!(await click(page.getByRole('link', { name: 'Продолжить' }), 'checkout_start'))) return

  // Fill whichever form rendered. The email input (type=email) exists on BOTH
  // the delivery and email-only forms and carries the cleanup marker, so every
  // test order is deletable by `email like 'stress-%@example.com'`.
  const email = `stress-${Date.now()}-${session.id}@example.com`
  if (await page.locator('#ship-city').isVisible().catch(() => false)) {
    await page.locator('#ship-name').fill('Тест Тестов').catch(() => {})
    await page.locator('#ship-city').fill('Санкт-Петербург').catch(() => {})
    await page.locator('#ship-phone').fill('+78120000000').catch(() => {})
    await page.locator('#ship-street').fill('ул. Тестовая').catch(() => {})
    await page.locator('#ship-building').fill('1').catch(() => {})
    await page.locator('#ship-postal').fill('190000').catch(() => {})
  }
  await page.locator('input[type="email"]').first().fill(email).catch(() => {})
  await jitter(page, 500, 1000)

  // Confirm → pay via the in-app mock gateway.
  if (!(await click(page.getByRole('button', { name: 'Перейти к оплате' }), 'checkout_start'))) return
  if (!(await click(page.getByRole('button', { name: 'Подтвердить оплату' }), 'checkout_confirm'))) return
  // The confirm POSTs through a server action (create_pending_order) before the
  // full-page redirect to the mock gateway — give that round-trip room.
  await page.waitForURL('**/payments/mock**', { timeout: 25000 }).catch(() => {})
  await click(page.getByRole('button', { name: /Оплатить/ }).first(), 'pay_complete')
  await page.waitForURL('**/profile/orders**', { timeout: 15000 }).catch(() => {})

  await nav('/profile/orders')
  s('verify', 'order_history', { ok: true })
  await scrollPage(page, rand(1, 2))
  await nav('/profile')
  await scrollPage(page, rand(1, 2))

  // Browse extras (probabilistic).
  if (Math.random() < 0.5) { await nav('/gift-cards'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/subscription'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/dino-magazine'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.3) { await nav('/about') }

  // Comprehensive page sweep — deterministic, covers every storefront route
  // so CLS attribution lands on ALL pages (the probabilistic section above
  // skips routes on many runs, leaving gaps in the per-route CLS report).
  // Profile subpages require auth; anon visits render the LoginModal shell.
  for (const path of [
    '/authors', '/contacts', '/abzac', '/suggest-manuscript',
    '/profile/books', '/profile/courses', '/profile/subscriptions',
    '/profile/gift-cards', '/profile/favorites',
  ]) {
    await nav(path)
    await scrollPage(page, rand(1, 2))
  }

  // One book detail page (pick from the homepage links if available).
  const bookHrefs = await page
    .evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="/books/"]'))
        .filter((a) => !a.href.includes('#'))
        .map((a) => a.href),
    )
    .catch(() => [])
  if (bookHrefs.length) {
    const { durationMs, cwv } = await measureNavigation(page, bookHrefs[rand(0, bookHrefs.length - 1)])
    s('navigate', 'goto /books/[slug]', { durationMs, ok: true, ...(cwv ? { cwv } : {}) })
    await scrollPage(page, rand(2, 3))
  }
}
