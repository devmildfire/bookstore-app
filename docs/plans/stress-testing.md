# Stress Testing — plan

**Status:** implemented (all phases ++ CWV attribution)
**Test suite branch:** `stress-testing`
**Author/date:** 2026-06-25
**Related:** [docs/monitoring/README.md](../monitoring/README.md)

---

## 1. Goals

Endurance / soak test the **live prod site** by driving real Chrome browsers through full user journeys. The test surfaces memory leaks, resource exhaustion, performance degradation under sustained activity, and broken flows that only appear under realistic use — and lets us watch the **Grafana dashboard** react under load to decide what to fix. Running against prod is the intended use (not a hazard): the marker-based cleanup removes only test orders.

**Specific goals:**

- Verify the prod site survives 30+ minutes of continuous simulated user activity without degrading
- Watch the Grafana monitoring dashboard under sustained load — spot which signals move (TTFB, error rate, DB) and prioritise fixes
- Exercise every major storefront route under realistic browsing patterns
- Complete the full checkout-to-paid-order flow end-to-end
- Collect timing data per action to spot regressions
- Confirm the mock payment gateway handles concurrent orders

**Non-goals:** load testing (thousands of requests/sec), distributed tracing, CI integration (for now).

---

## 2. Stack

> **Refactored 2026-06-26** to the project's own browser-automation stack. Was
> `puppeteer-core` + `chrome-launcher` (one OS Chrome per session) + an unused
> `chrome-devtools-mcp` dep. Now **Playwright** (`@playwright/test`, already a
> project dep for E2E) — one shared Chromium, N isolated contexts, auto-waiting
> text locators, built-in device profiles. No separate `package.json`/lockfile;
> run it via `npm run stress`.

| Component | Role |
|---|---|
| **`@playwright/test`** | Browser control — `chromium.launch()` once, one `browser.newContext()` per session; `devices['Pixel 5' / 'Desktop Chrome']` for emulation; `getByRole`/`getByText` auto-waiting locators |
| **`Node.js`** (`util.parseArgs`) | Runner runtime + CLI parsing (no framework) |

One Chromium process serves all sessions; each session is a fresh context (clean cookies/storage = a new anon user), so concurrency scales by contexts, not OS processes.

### CWV measurement methodology

The stress test collects CWV using the browser's PerformanceObserver API (injected in-page via `lib/cwv.mjs`), not the `web-vitals` library. This allows capturing attribution data (which element caused the CLS, which tag+class drove the LCP) that the aggregate `web-vitals` beacon cannot provide.

| Metric | API | Field recorded | Attribution |
|---|---|---|---|
| **TTFB** | `performance.getEntriesByType('navigation')[0].responseStart` | `cwv.ttfb.value` (ms) | — |
| **FCP** | `performance.getEntriesByType('paint')` | `cwv.fcp.value` (ms) | — |
| **LCP** | `PerformanceObserver('largest-contentful-paint')` | `cwv.lcp.value` (ms) | `cwv.lcp.element` (tag, id, className), `cwv.lcp.url` |
| **CLS** | `PerformanceObserver('layout-shift')` | `cwv.cls.value` (score) | `cwv.cls.sources[]` — up to 10 shifted elements with `{node: {tag, id, className, text}, prev: {x,y,w,h}, cur: {x,y,w,h}}` |
| **INP** | `PerformanceObserver('event')` stored on `window.__cwv.inp` | `cwv.inp.value` (ms) | `cwv.inp.element` (tag, id, className, text), `cwv.inp.type` |

The observers are registered via `context.addInitScript(cwvInitScript)` so they exist **before** page scripts run (capturing the first LCP/CLS/INP of every navigation into `window.__cwv`, fresh per document); `measureNavigation` reads the snapshot after the page settles. (`connectionTime` was recorded but never consumed by any analysis, so it was dropped in the 2026-06-26 refactor.)

**TTFB:** full `responseStart`, matching the `web-vitals` library and Grafana's RUM data, so JSONL is comparable to the dashboard.

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
npm run stress -- \
  --sessions 2              # concurrent browser contexts (default 2)
  --duration 30             # minutes (default 30)
  --device both             # mobile, desktop, or both (default both)
  --url https://bookstore-app.mildfire.dev   # default: the prod live site
  --keep                    # skip cleanup of test orders
```

- Default target is **prod** — the whole point is to stress the live site, surface real weaknesses, and watch the Grafana dashboard react under load. Marker-based cleanup (§7) makes this safe: only test orders are removed. Point `--url` at localhost to dry-run a journey change.
- `--device both` spawns one mobile + one desktop worker; `--device mobile`/`desktop` spawns that type only.
- Workers run concurrently against one shared Chromium; each loop iteration uses a fresh context (new anon user).

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

The journey fills **every** checkout's email field (both the delivery form's `#ship-email` and the email-only form's `#checkout-email` are `type=email`) with a marker address `stress-…@example.com`. On completion, the runner deletes orders by that marker — a single service-role `DELETE /rest/v1/Orders?email=like.stress-*@example.com` (OrderItems cascade).

**Deleting by marker, not by time window** (the original cut every order created during the run) means a real customer order placed during a run is **never** touched — important because the runner can target a remote site. `--keep` skips cleanup so orders can be inspected; cleanup also no-ops without `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.

On `SIGINT` the first Ctrl-C lets in-flight journeys finish, then cleanup + summary run once (a second Ctrl-C force-quits). The old handler reassigned a `const`, which threw — so interrupting skipped cleanup entirely; fixed in the 2026-06-26 refactor.

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

## 11. Cart CLS investigation

### Finding

The 2-hour stress test revealed CLS on `/cart` (mobile 0.21, desktop 0.17) and `/subscription` (mobile 0.46). Root cause for cart: **TanStack Query fetches cart items client-side, causing an EmptyCart→items grid DOM swap that pushes the footer down.**

Attribution data (exact CLS sources from PerformanceObserver, `buffered: true`):

```
t=696ms  value=+0.1035
  <FOOTER> y:486→674  h:358→170   footer moves down 188px, shortens
  <DIV>   y:673→0     h:44→0      social icons reference detached
  <A>     y:737→0     h:42→0      credit link reference detached
```

The footer shift happens at **696ms** after navigation — coinciding with React hydration + TanStack Query fetch completing. The old footer DOM nodes are detached and replaced (the `y:0 h:0` entries), proving a React re-render, not a CSS font-swap.

### First SSR attempt (looked like it failed — wrong root cause)

The first attempt prefetched `getCartServer()` and fed it to `useQuery` as `initialData` **through a React context** (`CartInitialDataProvider`) rendered inside `CartPage`. It rendered empty and was written up as "SSR can't work — `createClient()` has no auth cookie at SSR." **That diagnosis was wrong.** The real cause: `CartProvider` is a **global ancestor** (root `providers.tsx`), and the context Provider was its **descendant** — context only flows *down*, so `useCartInitialData()` inside `CartProvider` always read the default empty value. `initialData` was permanently `undefined`; the server fetch was dead. (Independently, even a working `initialData` on the ancestor provider couldn't fill the SSR HTML — the provider renders before the page on the server.)

### Resolution (shipped 2026-06-26) — SSR works, via props not context

`/cart` (and `/checkout`) fetch the cart server-side and pass it to `CartView`/`CheckoutView` as **props**; the view renders from props until the client query resolves (`isCartReady`). The cookie is **not** a blocker: the anon session's `sb-*-auth-token` cookie is written client-side on add-to-cart and sent on the next navigation, so `getCartServer()` reads it at SSR time.

**Verified in a fresh isolated browser context** (no prior cookies → add item → first `/cart` load): the SSR HTML (`fetch('/cart')`) contains the real item, not an empty cart. Measured CLS `/cart` **0** (desktop + mobile), `/subscription` **0** (was 0.16/0.27 — fixed by rendering that section `eager`, a separate but related defer-above-the-fold bug). Full write-up: [frontend-architecture-rendering Post-Phase-7](./frontend-architecture-rendering.md).

The always-render `SkeletonCartRow` idea is therefore **not needed** — SSR shows the real cart on first paint, which is strictly better than a skeleton. Keep it in reserve only if a future change makes the SSR cart fetch impossible (e.g. moving the session fully out of cookies).

---

## 12. Risks

- **Chromium not installed** — Playwright's bundled Chromium is used (`chromium.launch()`); it's already installed for E2E (`npx playwright install chromium` if missing).
- **Site changes break selectors** — text/role locators (`getByRole('button', { name: 'Добавить в корзину' })`) are resilient to markup changes but tied to the Russian copy; update if labels change.
- **Mock gateway interactive flow changes** — the mock payment form has click targets that could change.
- **Rate limiting / WAF** — sustained activity may trigger Cloudflare challenges on a remote target. Mitigation: respect delays, randomize timing, avoid bot-like patterns.
- **Concurrency ceiling** — one Chromium, N contexts is light, but each context is still a full page + JS; a single machine realistically drives ~10–20 concurrent sessions before CPU/memory caps. For higher load, this is the wrong tool (it's a browser-level soak/CWV test, not an HTTP load generator).
