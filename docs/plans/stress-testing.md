# Stress Testing — plan

**Status:** implemented (all phases ++ CWV attribution)
**Test suite branch:** `stress-testing`
**Author/date:** 2026-06-25
**Related:** [docs/monitoring/README.md](../monitoring/README.md),
the Chrome DevTools MCP (https://github.com/ChromeDevTools/chrome-devtools-mcp)

---

## 1. Goals

Endurance / soak test the live bookstore site by driving real Chrome browsers through full user journeys. The test surfaces memory leaks, resource exhaustion, performance degradation under sustained activity, and broken flows that only appear under realistic use.

**Specific goals:**

- Verify the site survives 30+ minutes of continuous simulated user activity without degrading
- Exercise every major storefront route under realistic browsing patterns
- Complete the full checkout-to-paid-order flow end-to-end
- Collect timing data per action to spot regressions
- Confirm the mock payment gateway handles concurrent orders

**Non-goals:** load testing (thousands of requests/sec), distributed tracing, CI integration (for now).

---

## 2. Stack

| Component | Role |
|---|---|
| **Chrome DevTools MCP** | Interactive debugging & scenario development |
| **`puppeteer-core`** | Programmatic Chrome control for the soak runner |
| **`chrome-launcher`** | Finds/launches a local Chrome installation |
| **`Node.js`** | Test runner runtime (no framework) |

The Chrome DevTools MCP is wired into `.opencode.json` for interactive sessions. The automated soak runner is a standalone Node.js script using the same CDP primitives — an MCP-mediated test would be too slow and token-expensive for a 30-minute multi-session soak.

### CWV measurement methodology

The stress test collects CWV using the browser's PerformanceObserver API (injected in-page via `lib/cwv.mjs`), not the `web-vitals` library. This allows capturing attribution data (which element caused the CLS, which tag+class drove the LCP) that the aggregate `web-vitals` beacon cannot provide.

| Metric | API | Field recorded | Attribution |
|---|---|---|---|
| **TTFB** | `performance.getEntriesByType('navigation')[0].responseStart` | `cwv.ttfb.value` (ms) | — |
| **FCP** | `performance.getEntriesByType('paint')` | `cwv.fcp.value` (ms) | — |
| **LCP** | `PerformanceObserver('largest-contentful-paint')` | `cwv.lcp.value` (ms) | `cwv.lcp.element` (tag, id, className), `cwv.lcp.url` |
| **CLS** | `PerformanceObserver('layout-shift')` | `cwv.cls.value` (score) | `cwv.cls.sources[]` — up to 10 shifted elements with `{node: {tag, id, className, text}, prev: {x,y,w,h}, cur: {x,y,w,h}}` |
| **INP** | `PerformanceObserver('event')` stored on `window.__stressInp` | `cwv.inp.value` (ms) | `cwv.inp.element` (tag, id, className, text), `cwv.inp.type` |

**TTFB vs connectionTime:** The test records both `ttfb` (full `responseStart`, matching the `web-vitals` library and Grafana's RUM data) and `connectionTime` (`connectEnd - connectStart`). The server-only response time can be derived as `ttfb - connectionTime`. On warm navigations (connection reused via HTTP keep-alive) `connectionTime` is 0 and `ttfb` equals the server response time.

**Warmup:** Before the first measured navigation, the test navigates to `/robots.txt` (a plain-text endpoint with zero page resources). This establishes the browser-level HTTP connection (DNS+TCP+TLS) without caching any images, fonts, JS bundles, or CSS that would skew subsequent LCP/FCP measurements. The `/robots.txt` warmup does not trigger the `<WebVitals />` beacon. Real browsers reuse HTTP connections via keep-alive on subsequent navigations, so this matches real-user conditions — and PSI/Lighthouse, which measures from persistent connections.

**Why not `responseStart - requestStart`:** The `web-vitals` library (which feeds Grafana's RUM data) uses `responseStart`. The stress test matches this methodology so JSONL data is comparable to the Grafana dashboard. Separately recording `connectionTime` lets analysis scripts isolate the server portion when needed.

---

## 3. Real route map

All routes live under `https://bookstore-app.mildfire.dev`.

| Route | Type | What's there |
|---|---|---|
| `/` | Page | Homepage — hero slider + streaming catalog grid |
| `/books/[slug]` | Page (dynamic) | Book detail — editions, photos, add-to-cart |
| `/cart` | Page | Cart view with promo code form |
| `/checkout` | Page | Single-page checkout (shipping or email form) |
| `/payments/mock` | Page | Mock payment gateway (interactive form) |
| `/payments/success` | Handler | Verifies signature, redirects to `/profile/orders` |
| `/payments/fail` | Handler | Order stays pending, redirects to order history |
| `/profile` | Page | Profile dashboard (anon user overview) |
| `/profile/orders` | Page | Order history list |
| `/profile/books` | Page | Purchased books list |
| `/gift-cards` | Page | Gift card products browse |
| `/subscription` | Page | Subscription plans browse |
| `/dino-magazine` | Page | Article feed with infinite scroll |
| `/dino-magazine/[slug]` | Page (dynamic) | Article detail |
| `/authors/[id]` | Page (dynamic) | Author detail |
| `/about` | Page | About the publisher (static) |
| `/contacts` | Page | Contact form + newsletter signup |
| `/api/vitals` | POST handler | RUM beacon sink (hit by real browsers) |

---

## 4. User journey

Each session runs this loop for the configured duration. Some steps are randomized (which book cards, scroll distance, delays) so each iteration differs.

| # | Step | Route | Action | Notes |
|---|---|---|---|---|
| 1 | — | — | Launch Chrome (headed, visible) | Mobile (iPhone 12) or Desktop (1920×1080) viewport |
| 2 | Navigate | `/` | Go to homepage | Wait for hero + catalog grid to render |
| 3 | Browse home | `/` | Scroll through hero + catalog sections | Pause 2-5s between scrolls |
| 4 | Open book | `/books/[slug]` | Click a book card from catalog | Pick a random card |
| 5 | Book detail | `/books/[slug]` | Scroll description, edition tabs, photos | Wait 2-4s per section |
| 6 | Add to cart | `/books/[slug]` | Click "В корзину" on an edition | Pick print or digital |
| 7 | Browse more | `/` | Navigate back, scroll to another book | Repeat steps 4-6 for 1-3 items total |
| 8 | View cart | `/cart` | Navigate to cart, verify items loaded | Scroll, check promo code form is visible |
| 9 | Checkout | `/checkout` | Fill shipping address (if physical items) or email, click confirm | Wait for confirmation modal |
| 10 | Pay | `/payments/mock` | Click through mock gateway buttons | Complete the payment form |
| 11 | Verify order | → `/profile/orders` | Wait for redirect, verify order appears in list | Scroll history |
| 12 | Profile | `/profile` | Inspect anon profile dashboard | Sidebar nav visible |
| 13 | Browse extras | `/gift-cards` | Scan gift card offerings | Quick browse (50% of loops) |
| 14 | Browse extras | `/subscription` | Scan subscription plans | Quick browse (50% of loops) |
| 15 | Browse extras | `/dino-magazine` | Scroll article feed | Load more articles (50% of loops) |
| 16 | Browse extras | `/about` | Visit static content page | 30% of loops |
| 17 | Close | — | Close browser | End loop iteration |

**Randomization:**
- Which book cards to click (random selection from visible grid)
- Delays between actions: uniform 1-5s
- Which extra pages to visit (50% probability each)
- Scroll distances: random fraction of viewport height

---

## 5. CLI

```
node scripts/stress-test/stress-runner.mjs \
  --sessions 2              # concurrent browser sessions (default 2)
  --duration 30             # minutes (default 30)
  --device both             # mobile, desktop, or both (default both)
  --url https://bookstore-app.mildfire.dev
  --keep                    # skip cleanup of test orders
```

- `--device both` spawns one mobile + one desktop session
- `--device mobile` or `--device desktop` spawns that type only
- Sessions run independently; each spawns its own headed Chrome window

---

## 6. Output

| Output | Format | Content |
|---|---|---|
| Console (live) | Text | Session started/completed, step progress, per-step timing, errors, final summary by device |
| JSONL files (per device) | `stress-results/stress-results-{mobile,desktop}-<timestamp>.jsonl` | One JSON per action: `{timestamp, sessionId, deviceType, step, action, durationMs, ok, error?, cwv?}` |

Each action entry may include a `cwv` object with measured Core Web Vitals (present on `navigate` steps and some `click` steps):

```json
{
  "sessionId": "mobile-1782417144500-698c",
  "deviceType": "mobile",
  "step": "navigate",
  "action": "goto /cart",
  "durationMs": 2184,
  "ok": true,
  "cwv": {
    "ttfb": {"value": 134},
    "connectionTime": {"value": 0},
    "lcp": {"value": 436, "element": {"tag": "IMG", "className": "CartItemRow-module__image"}, "url": "..."},
    "cls": {"value": 0.21, "sources": [{"node": {"tag": "FOOTER", "text": "(812) 915-83-67..."}, "prev": {"x":0,"y":486,"w":375,"h":358}, "cur": {"x":0,"y":0,"w":0,"h":0}}]}
  }
}
```

Summary line at the end:
```
=== Results by device ===
  [mobile] 337 actions, 332 ok, 5 errors, 19 orders
  [desktop] 336 actions, 329 ok, 7 errors, 17 orders
```

---

## 7. Cleanup

On normal completion or SIGINT, the runner calls `cancel_pending_order` RPC (via Supabase service-role admin client) for every order the test created. This cleans both `pending` and `paid` test orders.

`--keep` flag skips cleanup so orders can be inspected manually.

---

## 8. Analysis

The `analyze.mjs` script reads all JSONL files from `stress-results/` and produces a structured CWV report:

```bash
node scripts/stress-test/analyze.mjs
```

Output: `stress-results/cwv-report-<timestamp>.json` with:

- **`perRoute`** — pages grouped by route and device, with p75/median/avg/min/max for each metric
- **`perRoute[route].lcp_elements`** — top 5 LCP-driving elements per page (tag+class, avg time, occurrence count)
- **`perRoute[route].cls_elements`** — top 10 CLS-causing elements per page (tag+text, max shift, occurrence count)
- **`issues`** — metrics flagged beyond thresholds (🔴 bad / 🟡 warn), sorted by severity, with attribution

Thresholds:

| Metric | Warn | Bad |
|---|---|---|
| TTFB | > 400ms | > 800ms |
| FCP | > 1.8s | > 3.0s |
| LCP | > 2.5s | > 4.0s |
| CLS | > 0.1 | > 0.25 |
| INP | > 100ms | > 200ms |

---

## 9. Implementation phases

| Phase | Deliverable | Acceptance |
|---|---|---|
| **1 — Scaffold** | `scripts/stress-test/` dir, `package.json`, `stress-runner.mjs` CLI skeleton, `.opencode.json` Chrome DevTools MCP wiring | `--help` prints flags; MCP tools available in Claude |
| **2 — Browser + device** | `lib/browser.mjs` — Chrome launch via `chrome-launcher`, device emulation (viewport + UA for mobile/desktop), session lifecycle | One `node -e '...'` opens Chrome at correct viewport |
| **3 — Journey steps** | `scenarios/user-journey.mjs` — all 17 steps as async functions with delays + randomization | Manual run navigates the full journey once |
| **4 — Reporter** | `lib/reporter.mjs` — JSONL writer with auto-flush, console summary formatter | File + console output verified |
| **5 — Soak loop + cleanup** | `stress-runner.mjs` — session pool, duration-based loop, SIGINT handler, order cleanup via admin RPC | 2-minute smoke run creates orders then deletes them |
| **6 — Full run** | Execute `--duration 30 --sessions 2 --device both` against live site | All phases green, JSONL file written, orders cleaned |
| **7 — CWV collector** | `lib/cwv.mjs` — TTFB/FCP/LCP/CLS/INP with element attribution via PerformanceObserver | Per-page CWV data in JSONL output |
| **8 — Analysis** | `analyze.mjs` — report generator with issue detection by thresholds | Structured JSON report identifying weak spots |

---

## 10. Tracker

```
Status legend:
  [ ] not started   [~] in progress   [x] done   [!] blocked

## Phases

  [x] 1 — Scaffold (dir, deps, CLI, MCP wiring)
  [x] 2 — Browser + device (launch, emulation, session lifecycle)
  [x] 3 — Journey steps (all 17 steps as async scenario)
  [x] 4 — Reporter (JSONL + console summary)
  [x] 5 — Soak loop + cleanup (pool, duration, order deletion)
  [x] 6 — Full run against live site
  [x] 7 — CWV collector (attribution via PerformanceObserver)
  [x] 8 — Analysis (report generator with threshold detection)
```

---

## 11. Risks

- **Chrome not installed / wrong version** — `chrome-launcher` finds the system Chrome; fallback: install Chromium via `puppeteer` (bundled).
- **Site changes break selectors** — all element selectors will need updating if the UI changes. Mitigation: add a `selectors` config file for easy retargeting.
- **Mock gateway interactive flow changes** — the mock payment form has click targets that could change.
- **Rate limiting / WAF** — sustained activity may trigger Cloudflare challenges. Mitigation: respect delays, randomize timing, avoid bot-like patterns.
- **Headless detection** — headed mode reduces detection risk, but some sites use bot-detection JS. Mitigation: standard UA + viewport from real device profiles.
