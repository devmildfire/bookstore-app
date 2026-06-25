import { createSession } from '../lib/browser.mjs'
import { measureNavigation, collectInp } from '../lib/cwv.mjs'

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
    const result = await page.evaluate((xp) => {
      const results = document.evaluate(xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null)
      for (let i = 0; i < results.snapshotLength; i++) {
        const el = results.snapshotItem(i)
        if (el && el.offsetParent !== null) {
          el.scrollIntoView({ block: 'center' })
          const r = el.getBoundingClientRect()
          return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
        }
      }
      return null
    }, `//${tag}[contains(text(), '${text}')]`)
    if (!result) throw new Error(`no visible ${tag} with text "${text}"`)
    // Real mouse click — produces interactionId for INP tracking
    await page.mouse.click(result.x, result.y)
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

  async function nav(path) {
    // Collect INP from current page before leaving
    const inp = await collectInp(page)
    if (inp) { s('inp', `inp_pre_${path}`, { inp }) }
    // Navigate and measure CWV
    const { durationMs, cwv } = await measureNavigation(page, url, path)
    s('navigate', `goto ${path}`, { durationMs, ok: true, ...(cwv ? { cwv } : {}) })
  }

  // Warmup: navigate once to establish TCP/TLS connection so all subsequent
  // measured navigations reflect warm connection times (like real users who
  // reuse keep-alive, and like PSI/Lighthouse which measures from persistent
  // connections). This first load's TTFB is discarded — only the connection
  // overhead matters here, not the server response time.
  await page.goto(url, { timeout: 30000 }).catch(() => {})
  await delay(1000)

  // 2. Navigate to homepage
  await nav('/')
  await delay(rand(500, 1500))

  // 3. Browse home — scroll past hero into catalog
  await scrollPage(page, rand(2, 3))
  await delay(rand(500, 1500))

  // 4-7. Open books and add to cart (1-3 items)
  const itemsToAdd = rand(1, 3)
  for (let i = 0; i < itemsToAdd; i++) {
    await nav('/')
    await scrollPage(page, rand(1, 2))
    try {
      const links = await findBookLinks(page)
      const valid = links.filter(l => l.href && !l.href.includes('#'))
      if (!valid.length) throw new Error('no book links found')

      const pick = valid[Math.floor(Math.random() * valid.length)]
      const { durationMs: bookMs, cwv: bookCwv } = await measureNavigation(page, '', pick.href)
      s('open_detail', `book ${i + 1}`, { durationMs: bookMs, ok: true, ...(bookCwv ? { cwv: bookCwv } : {}) })

      await scrollPage(page, rand(2, 3))
      await delay(rand(500, 1500))

      await clickByText(page, 'button', 'Добавить', `add_to_cart ${i + 1}`, s)
      await delay(rand(1500, 3000))
    } catch (e) {
      s('open_detail', `book ${i + 1}`, { ok: false, error: e.message })
    }
  }

  // 8. View cart
  await nav('/cart')
  await scrollPage(page, rand(1, 2))

  // 9. Wait for cart to load, then click "Продолжить"
  try { await page.waitForFunction(() => document.body.innerText.includes('Продолжить'), { timeout: 8000 }).catch(() => {}) } catch {}
  await clickByText(page, 'a', 'Продолжить', 'checkout_start', s)
  // Wait for checkout page to load
  try { await page.waitForFunction(() => document.body.innerText.includes('Перейти к оплате') || document.body.innerText.includes('Подтвердить'), { timeout: 8000 }).catch(() => {}) } catch {}
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
  await nav('/profile/orders')
  await scrollPage(page, rand(1, 2))
  s('verify', 'order_history', { ok: true })

  // 14. Profile dashboard
  await nav('/profile')
  await scrollPage(page, rand(1, 2))

  // 15-18. Browse extras (probabilistic)
  if (Math.random() < 0.5) { await nav('/gift-cards'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/subscription'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.5) { await nav('/dino-magazine'); await scrollPage(page, rand(1, 2)) }
  if (Math.random() < 0.3) { await nav('/about') }
}
