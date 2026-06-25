// Core Web Vitals collector with attribution.
// Measures TTFB, FCP, LCP, CLS, INP with DOM element attribution
// via PerformanceObserver APIs injected in-browser.

async function snapshotInPage(page, waitMs) {
  return page.evaluate((delay) => new Promise((resolve) => {
    const results = {}

    // TTFB — Navigation Timing
    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length) {
      results.ttfb = { value: Math.round(navEntries[0].responseStart) }
    }

    // FCP — Paint Timing
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(e => e.name === 'first-contentful-paint')
    if (fcpEntry) {
      results.fcp = { value: Math.round(fcpEntry.startTime) }
    }

    // LCP — Largest Contentful Paint with element attribution
    let lcpEntry = null
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length) lcpEntry = entries[entries.length - 1]
      }).observe({ type: 'largest-contentful-paint', buffered: true })
    } catch {}

    // CLS — Cumulative Layout Shift with source element attribution
    let clsScore = 0
    let clsShifts = []
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value
            if (entry.sources && entry.sources.length) {
              for (const s of entry.sources) {
                clsShifts.push({
                  node: s.node ? { tag: s.node.tagName, id: s.node.id, className: s.node.className, text: (s.node.textContent || '').slice(0, 80) } : null,
                  prev: { x: s.previousRect?.x || 0, y: s.previousRect?.y || 0, w: s.previousRect?.width || 0, h: s.previousRect?.height || 0 },
                  cur: { x: s.currentRect?.x || 0, y: s.currentRect?.y || 0, w: s.currentRect?.width || 0, h: s.currentRect?.height || 0 },
                })
              }
            }
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })
    } catch {}

    // INP — persistent observer stored on window.__stressInp
    // so it can be read before the next navigation (not just in 3s window)
    // If window.__stressInp already exists from a previous observer, update it.
    // Otherwise create a new one.
    if (!window.__stressInp) {
      window.__stressInp = { value: 0, element: null, type: null }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > window.__stressInp.value && entry.duration > 0 && entry.interactionId) {
              window.__stressInp.value = Math.round(entry.duration)
              window.__stressInp.element = entry.target ? { tag: entry.target.tagName, id: entry.target.id, className: entry.target.className, text: (entry.target.textContent || '').slice(0, 80) } : null
              window.__stressInp.type = entry.name || null
            }
          }
        }).observe({ type: 'event', durationThreshold: 0, buffered: true })
      } catch {}
    }
    if (window.__stressInp.value > 0) {
      results.inp = { value: window.__stressInp.value, element: window.__stressInp.element, type: window.__stressInp.type }
    }

    setTimeout(() => {
      if (lcpEntry) {
        results.lcp = {
          value: Math.round(lcpEntry.renderTime || lcpEntry.loadTime || 0),
          element: lcpEntry.element ? { tag: lcpEntry.element.tagName, id: lcpEntry.element.id, className: lcpEntry.element.className } : null,
          url: lcpEntry.url || null,
        }
      }
      if (clsScore > 0) {
        results.cls = { value: +clsScore.toFixed(4), sources: clsShifts.slice(0, 10) }
      }
      resolve(results)
    }, delay)
  }), waitMs)
}

/**
 * Read INP value stored on the page (from the persistent observer).
 * Call this before navigating away from a page with interactions.
 */
export async function collectInp(page) {
  try {
    return await page.evaluate(() => {
      const stored = window.__stressInp
      if (!stored || !stored.value) return null
      return { value: stored.value, element: stored.element, type: stored.type }
    })
  } catch { return null }
}

/**
 * Navigate to a URL and measure CWV with attribution.
 */
export async function measureNavigation(page, baseUrl, path, waitMs = 3000) {
  const start = Date.now()
  await page.goto(`${baseUrl}${path}`, { timeout: 30000 }).catch(() => {})
  const navMs = Date.now() - start

  let cwv = {}
  try {
    cwv = await snapshotInPage(page, waitMs)
  } catch {}

  return { durationMs: Math.round(navMs), cwv: Object.keys(cwv).length ? cwv : undefined }
}

/**
 * Measure CWV on the current page (no navigation).
 */
export async function measureCurrentPage(page, waitMs = 3000) {
  let cwv = {}
  try {
    cwv = await snapshotInPage(page, waitMs)
  } catch {}
  return Object.keys(cwv).length ? cwv : undefined
}
