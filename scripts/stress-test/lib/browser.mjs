import { launch } from 'chrome-launcher'

const DEVICES = {
  mobile: { viewport: { width: 390, height: 844 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  desktop: { viewport: { width: 1920, height: 1080 }, userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
}

export async function createSession(deviceType) {
  const device = DEVICES[deviceType]
  if (!device) throw new Error(`Unknown device: ${deviceType}`)

  const chrome = await launch({
    chromeFlags: ['--no-first-run', '--disable-extensions', '--window-size=1280,800'],
    logLevel: 'error',
  })

  const { default: puppeteer } = await import('puppeteer-core')
  const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}`, defaultViewport: null })
  const page = await browser.newPage()

  await page.setViewport(device.viewport)
  await page.setUserAgent(device.userAgent)

  return {
    id: `${deviceType}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    deviceType,
    browser,
    page,
    chrome,
    async close() {
      try { await page.close() } catch {}
      try { await browser.disconnect() } catch {}
      try { await chrome.kill() } catch {}
    },
  }
}
