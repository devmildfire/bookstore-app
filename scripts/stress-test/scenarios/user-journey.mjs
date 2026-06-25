import { createSession } from '../lib/browser.mjs'

function delay(ms) { return new Promise(r => setTimeout(r, ms)) }
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

async function scrollPage(page, steps = 3) {
  for (let i = 0; i < steps; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7)).catch(() => {})
    await delay(rand(500, 1500))
  }
}

async function clickByText(page, tag, text, stepName, makeEntry) {
  const start = Date.now()
  try {
    const xpath = `//${tag}[contains(text(), '${text}')]`
    const clicked = await page.evaluate((xp) => {
      const results = document.evaluate(xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = 0; i < results.snapshotLength; i++) {
        const el = results.snapshotItem(i)
        if (el && el.offsetParent !== null) { el.click(); return true }
      }
      return false
    }, xpath)
    if (!clicked) throw new Error(`no visible ${tag} with text "${text}"`)
    makeEntry('click', stepName, { durationMs: Date.now() - start, ok: true })
    await delay(rand(1000, 3000))
  } catch (e) {
    makeEntry('click', stepName, { durationMs: Date.now() - start, ok: false, error: e.message })
  }
}

async function findBookLinks(page) {
  return page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/books/"]'))
    return links.map(l => ({ href: l.href, text: l.textContent.trim(), parentClass: l.parentElement?.className || '' }))
      .filter(l => l.parentClass.includes('BookCard') || l.parentClass.includes('Slider'))
  })
}

async function fillField(page, id, value) {
  try {
    await page.evaluate((id) => { document.getElementById(id)?.focus() }, id)
    await page.type(`#${id}`, value, { delay: 50 })
  } catch {}
}

export async function runJourney(session, { url, reporter }) {
  const { page } = session
  const s = (step, action, extra = {}) => {
    reporter.record({ sessionId: session.id, deviceType: session.deviceType, timestamp: new Date().toISOString(), step, action, ...extra })
  }

  async function nav(path, waitMs = 1000) {
    const start = Date.now()
    await page.goto(`${url}${path}`, { timeout: 30000 }).catch(() => {})
    await delay(waitMs)
    s('navigate', `goto ${path}`, { durationMs: Date.now() - start, ok: true })
  }

  // 2. Navigate to homepage
  await nav('/')
  await delay(rand(500, 1500))

  // 3. Browse home — scroll past hero into catalog
  await scrollPage(page, rand(2, 3))
  await delay(rand(500, 1500))

  // 4-7. Open books and add to cart (1-3 items)
  const itemsToAdd = rand(1, 3)
  for (let i = 0; i < itemsToAdd; i++) {
    await nav('/', 500)
    await scrollPage(page, rand(1, 2))

    const start = Date.now()
    try {
      const links = await findBookLinks(page)
      const valid = links.filter(l => l.href && !l.href.includes('#'))
      if (!valid.length) throw new Error('no book links found')

      const pick = valid[Math.floor(Math.random() * valid.length)]
      await page.goto(pick.href, { timeout: 30000 }).catch(() => {})
      await delay(rand(1500, 3000))
      s('open_detail', `book ${i + 1}`, { durationMs: Date.now() - start, ok: true })

      await scrollPage(page, rand(2, 3))
      await delay(rand(500, 1500))

      await clickByText(page, 'button', 'Добавить', `add_to_cart ${i + 1}`, s)
      await delay(rand(1500, 3000))
    } catch (e) {
      s('open_detail', `book ${i + 1}`, { durationMs: Date.now() - start, ok: false, error: e.message })
    }
  }

  // 8. View cart
  await nav('/cart')
  await scrollPage(page, rand(1, 2))

  // 9. Cart → click "Продолжить" (link, not button)
  await clickByText(page, 'a', 'Продолжить', 'checkout_start', s)

  // 10. Fill checkout form if visible (physical book has shipping fields)
  await delay(rand(500, 1500))
  await fillField(page, 'ship-name', 'Тест Тестов')
  await fillField(page, 'ship-city', 'Санкт-Петербург')
  await fillField(page, 'ship-phone', '+78120000000')
  await fillField(page, 'ship-street', 'ул. Тестовая')
  await fillField(page, 'ship-email', `stress-${Date.now()}@example.com`)
  await fillField(page, 'ship-building', '1')
  await fillField(page, 'ship-postal', '190000')
  await delay(rand(500, 1000))

  // 11. Click "Перейти к оплате" — opens confirmation modal
  await clickByText(page, 'button', 'Перейти к оплате', 'checkout_start', s)

  // 12. Click "Подтвердить оплату" in modal → creates pending order, redirects to /payments/mock
  await delay(rand(1000, 2000))
  await clickByText(page, 'button', 'Подтвердить оплату', 'checkout_confirm', s)

  // 13. Wait for navigation to mock payment page
  try {
    await page.waitForFunction(() => window.location.href.includes('/payments/mock'), { timeout: 15000 }).catch(() => {})
  } catch {}
  await delay(rand(1000, 2000))

  // 14. Click mock gateway payment button to complete the order
  await clickByText(page, 'button', 'Оплатить', 'pay_complete', s)
  await delay(rand(3000, 5000))

  // 15. Navigate to order history
  try {
    await page.waitForFunction(() => window.location.pathname.includes('/profile/orders'), { timeout: 15000 }).catch(() => {})
    await delay(rand(500, 1000))
  } catch {}
  await nav('/profile/orders', 500)
  await scrollPage(page, rand(1, 2))
  s('verify', 'order_history', { ok: true })

  // 14. Profile dashboard
  await nav('/profile', 500)
  await scrollPage(page, rand(1, 2))

  // 15-18. Browse extras (probabilistic)
  if (Math.random() < 0.5) { await nav('/gift-cards', 500); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/subscription', 500); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/dino-magazine', 500); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.3) { await nav('/about', 500) }
}
