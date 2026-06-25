# Stress Testing — plan

**Status:** implemented
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
| Console (live) | Text | Session started/completed, step progress, per-step timing, errors, final summary |
| JSONL file | `stress-results-<timestamp>.jsonl` | One JSON object per action: `{timestamp, sessionId, iteration, step, route, action, durationMs, ok, error?}` |

Summary line at the end:
```
=== Stress test complete ===
Duration: 30m 12s
Sessions: 2 (1 mobile, 1 desktop)
Iterations: mobile=14, desktop=12
Actions: 624 total, 618 ok, 6 errors (0.96%)
Orders created: 26 (all cleaned up)
Memory (RSS max): mobile=342MB, desktop=368MB
```

---

## 7. Cleanup

On normal completion or SIGINT, the runner calls `cancel_pending_order` RPC (via Supabase service-role admin client) for every order the test created. This cleans both `pending` and `paid` test orders.

`--keep` flag skips cleanup so orders can be inspected manually.

---

## 8. Implementation phases

| Phase | Deliverable | Acceptance |
|---|---|---|
| **1 — Scaffold** | `scripts/stress-test/` dir, `package.json`, `stress-runner.mjs` CLI skeleton, `.opencode.json` Chrome DevTools MCP wiring | `--help` prints flags; MCP tools available in Claude |
| **2 — Browser + device** | `lib/browser.mjs` — Chrome launch via `chrome-launcher`, device emulation (viewport + UA for mobile/desktop), session lifecycle | One `node -e '...'` opens Chrome at correct viewport |
| **3 — Journey steps** | `scenarios/user-journey.mjs` — all 17 steps as async functions with delays + randomization | Manual run navigates the full journey once |
| **4 — Reporter** | `lib/reporter.mjs` — JSONL writer with auto-flush, console summary formatter | File + console output verified |
| **5 — Soak loop + cleanup** | `stress-runner.mjs` — session pool, duration-based loop, SIGINT handler, order cleanup via admin RPC | 2-minute smoke run creates orders then deletes them |
| **6 — Full run** | Execute `--duration 30 --sessions 2 --device both` against live site | All phases green, JSONL file written, orders cleaned |

---

## 9. Tracker

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
```

---

## 10. Risks

- **Chrome not installed / wrong version** — `chrome-launcher` finds the system Chrome; fallback: install Chromium via `puppeteer` (bundled).
- **Site changes break selectors** — all element selectors will need updating if the UI changes. Mitigation: add a `selectors` config file for easy retargeting.
- **Mock gateway interactive flow changes** — the mock payment form has click targets that could change.
- **Rate limiting / WAF** — sustained activity may trigger Cloudflare challenges. Mitigation: respect delays, randomize timing, avoid bot-like patterns.
- **Headless detection** — headed mode reduces detection risk, but some sites use bot-detection JS. Mitigation: standard UA + viewport from real device profiles.
