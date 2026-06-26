import { chromium, devices } from '@playwright/test'
import { cwvInitScript } from './cwv.mjs'

// Chromium-based device profiles. One browser process, N isolated contexts —
// far lighter than one OS browser per session (the old chrome-launcher model).
const PROFILES = {
  mobile: devices['Pixel 5'],
  desktop: devices['Desktop Chrome'],
}

// Network throttle presets (download/upload in bytes/s, latency in ms).
// Slow-3G approximates the real-world conditions that expose late-arrival
// layout shifts (images/fonts/async data reflowing after hydration) — the
// unthrottled stress test saw CLS ~0.025 while prod RUM shows p75 ~0.77.
const THROTTLES = {
  none: { offline: false, latency: 0, download: -1, upload: -1 },
  'slow-3g': { offline: false, latency: 400, download: 500 * 1024, upload: 500 * 1024 },
  'fast-3g': { offline: false, latency: 150, download: 1600 * 1024, upload: 750 * 1024 },
}

let counter = 0

export function launchBrowser() {
  return chromium.launch() // headless; Playwright's bundled Chromium (already installed for E2E)
}

// A session = a fresh browser context (clean cookies/storage = a new anon user).
// `throttle` ('none' | 'slow-3g' | 'fast-3g') emulates network conditions via CDP
// to reproduce the slow-load reflow that drives catastrophic CLS in prod RUM.
export async function createSession(browser, deviceType, throttle = 'none') {
  const profile = PROFILES[deviceType]
  if (!profile) throw new Error(`Unknown device: ${deviceType}`)
  const preset = THROTTLES[throttle]
  if (!preset) throw new Error(`Unknown throttle: ${throttle}`)
  const context = await browser.newContext(profile)
  await context.addInitScript(cwvInitScript)
  const page = await context.newPage()

  if (throttle !== 'none') {
    const cdp = context.newCDPSession
      ? await context.newCDPSession(page)
      : await context.newPage().then(() => null).catch(() => null)
    if (cdp) {
      await cdp.send('Network.enable').catch(() => {})
      await cdp.send('Network.emulateNetworkConditions', preset).catch(() => {})
    }
  }

  return {
    id: `${deviceType}-${++counter}`,
    deviceType,
    throttle,
    context,
    page,
    close: () => context.close().catch(() => {}),
  }
}
