import { chromium, devices } from '@playwright/test'
import { cwvInitScript } from './cwv.mjs'

// Chromium-based device profiles. One browser process, N isolated contexts —
// far lighter than one OS browser per session (the old chrome-launcher model).
const PROFILES = {
  mobile: devices['Pixel 5'],
  desktop: devices['Desktop Chrome'],
}

let counter = 0

export function launchBrowser() {
  return chromium.launch() // headless; Playwright's bundled Chromium (already installed for E2E)
}

// A session = a fresh browser context (clean cookies/storage = a new anon user).
export async function createSession(browser, deviceType) {
  const profile = PROFILES[deviceType]
  if (!profile) throw new Error(`Unknown device: ${deviceType}`)
  const context = await browser.newContext(profile)
  await context.addInitScript(cwvInitScript)
  const page = await context.newPage()
  return {
    id: `${deviceType}-${++counter}`,
    deviceType,
    context,
    page,
    close: () => context.close().catch(() => {}),
  }
}
