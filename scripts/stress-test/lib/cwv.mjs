// Core Web Vitals collector with element attribution (Playwright).
// `cwvInitScript` is registered via context.addInitScript so the observers are
// installed BEFORE page scripts run — capturing the first LCP/CLS/INP of every
// navigation (state is fresh per document). TTFB/FCP read from timing entries.

// Runs in-page. Self-contained (no outer refs) so Playwright can serialize it.
export function cwvInitScript() {
  window.__cwv = { lcp: null, cls: 0, clsSources: [], inp: null }
  const node = (n) =>
    n ? { tag: n.tagName, id: n.id, className: typeof n.className === 'string' ? n.className : '', text: (n.textContent || '').slice(0, 80) } : null
  const rect = (r) =>
    r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : { x: 0, y: 0, w: 0, h: 0 }

  try {
    new PerformanceObserver((l) => {
      const es = l.getEntries()
      const last = es[es.length - 1]
      if (last) window.__cwv.lcp = { value: Math.round(last.renderTime || last.loadTime || 0), element: node(last.element), url: last.url || null }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {}

  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.hadRecentInput) continue
        window.__cwv.cls += e.value
        for (const sourceEntry of e.sources || []) {
          window.__cwv.clsSources.push({ node: node(sourceEntry.node), prev: rect(sourceEntry.previousRect), cur: rect(sourceEntry.currentRect) })
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  } catch {}

  try {
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) {
        if (e.interactionId && e.duration > (window.__cwv.inp ? window.__cwv.inp.value : 0)) {
          window.__cwv.inp = { value: Math.round(e.duration), element: node(e.target), type: e.name || null }
        }
      }
    }).observe({ type: 'event', durationThreshold: 0, buffered: true })
  } catch {}
}

// Runs in-page. Reads the accumulated CWV after the page has settled.
function snapshot() {
  const r = {}
  const nav = performance.getEntriesByType('navigation')[0]
  if (nav) r.ttfb = { value: Math.max(0, Math.round(nav.responseStart)) }
  const fcp = performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint')
  if (fcp) r.fcp = { value: Math.round(fcp.startTime) }
  const c = window.__cwv
  if (c) {
    if (c.lcp) r.lcp = c.lcp
    if (c.cls > 0) r.cls = { value: +c.cls.toFixed(4), sources: c.clsSources.slice(0, 10) }
    if (c.inp) r.inp = c.inp
  }
  return Object.keys(r).length ? r : null
}

// Read INP from the current page (call before navigating away — clicks land
// their interaction timing after the initial post-nav snapshot).
export async function readInp(page) {
  return page.evaluate(() => (window.__cwv && window.__cwv.inp) || null).catch(() => null)
}

// Navigate to an absolute URL and snapshot CWV once the page has settled.
// settleMs defaults to 5000 (was 1500) — late-arrival layout shifts from
// async data, images, or fonts loading after hydration need more than 1.5s
// to manifest; the shorter settle missed the catastrophic CLS prod RUM shows.
export async function measureNavigation(page, absoluteUrl, settleMs = 5000) {
  const start = Date.now()
  await page.goto(absoluteUrl, { timeout: 30000, waitUntil: 'load' }).catch(() => {})
  const durationMs = Date.now() - start
  await page.waitForTimeout(settleMs)
  const cwv = await page.evaluate(snapshot).catch(() => null)
  return { durationMs, cwv: cwv || undefined }
}
