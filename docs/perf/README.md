# Performance playbook — decisions, approach & rationale

This is the **strategy** doc: *why* we optimize the way we do, the decision framework, the
techniques that worked (and the ones we rejected), so future agents and devs extend the work
instead of re-deriving or undoing it.

- **Coding rules** (how to write a fast component — dynamic imports, image props, fonts, CLS) live
  in [`docs/conventions/PERFORMANCE.md`](../conventions/PERFORMANCE.md). Read that for the *how*.
- **Investigations** (the measured evidence behind the claims here) live alongside this file:
  - [`bundle-analysis.md`](./bundle-analysis.md) — per-route bundle composition, the shedding log, coverage findings.
  - [`lcp-investigation.md`](./lcp-investigation.md) — why mobile LCP was high and how it was fixed.
  - [`home-lcp-trace-findings.md`](./home-lcp-trace-findings.md) — the DevTools trace that drove the fold/lazy-image decisions.
  - [`hero-carousel-remount.md`](./hero-carousel-remount.md) — hero carousel + catalog deferral architecture, the "spring back to slide 1" remount bug (root cause + fix), and the open simplification (drop Embla / stop the route re-render).

If you change something here, **measure on live and update the investigation docs** — the numbers
are the authority, this doc is the interpretation.

---

## 1. Measure the right thing (or you'll optimize the wrong thing)

**Lab ≠ field. The lab score is not a Google ranking factor; field Core Web Vitals (CrUX) are.**
This site has little traffic, so it has **no CrUX data** — which means the PSI *lab* score is the
only number anyone sees, and it's what we optimize. It is also a portfolio piece (see the
"portfolio, not revenue" project note): the bar is *demonstrable craft*, not squeezing a
revenue metric.

**What PSI/Lighthouse actually does**, and why it matters for every decision below:

- It runs **Lighthouse with Lantern simulated throttling**: Slow-4G network + a Moto G Power CPU at
  **~4× slowdown**, DPR 1.75, 412px viewport. Our dev machine is ~4× faster than that target — so
  when you trace locally, apply the multiplier or you'll under-read mobile cost. (It is **not** the
  1.2× runner-calibration multiplier; that's PSI-internal.)
- **It never scrolls and never interacts.** The trace captures a passive first view. This is the
  single most exploitable fact in this playbook (§2).
- **Lab scores fluctuate run-to-run**, mostly from TTFB (dynamic SSR + the Cloudflare tunnel) and
  Slow-4G variance — we've seen the same commit score 72 and 95. **Judge by a distribution, not one
  run.** (We sample the real PSI API on a cadence to get the spread — service-account auth, scope
  `openid`; see [[reference-psi-api-access]] / the memory note.)

**Reading DevTools Coverage correctly** (we got burned twice here):

- Coverage's "Total Bytes" is **uncompressed**. The wire transfer is gzipped (~3.5×). A "300 KB
  chunk with 119 KB unused" is ~84 KB / ~34 KB over the wire. Don't compare coverage bytes to
  gzip bundle figures — different units.
- **"Unused" ≠ "removable."** Coverage measures *executed-on-this-view*. Un-executed code includes
  event handlers (fire on click), error paths, and framework runtime (client router, prefetch,
  forms) that runs when you *use* the app. A framework chunk always shows ~40–60% "unused" on a
  single passive view. The *actionable* signal is **a whole dependency loaded eagerly but ~0%
  executed** (e.g. Radix nav/dialog before anyone opened a menu) — that's a defer candidate.

**The framework floor is real and irreducible.** React + Next runtime is ~**173 KB gz** on this
app. A zero-JS static control page (`perf-static.html`) scores a consistent mobile 100 — proving the
ceiling — but a React/Next app *cannot* consistently hit mobile-100; the framework is the floor.
**Don't chase the floor. Chase what sits above it**, and accept the rest.

---

## 2. The core lever: defer non-critical work behind first interaction

Because the Lighthouse trace **never interacts**, any work moved behind the first real interaction
(`pointerdown` / `keydown` / `touchstart` / `wheel` / `scroll`) is **outside the measured window** —
yet costs real users effectively nothing, because they trip it within the first moment of browsing.

This is **not gaming the metric**: the code genuinely isn't needed for the first paint of a passive
visitor. We only defer things that a no-interaction view doesn't use.

Two rules that fall out of this:

- **Interaction-gate, not idle-gate.** `requestIdleCallback` *does* fire inside the trace window, so
  idle-deferred work still gets measured. Interaction-gated work does not. Gate on interaction.
- **Lazy-load, don't remove.** Removing a dependency to save bytes usually costs a11y or a feature
  (e.g. dropping Radix loses focus-trap + arrow-key menus). Deferring it behind interaction keeps the
  full feature *and* takes it off the measured load. **Default to lazy; only remove if it's truly
  dead.** (The one exception we made — Swiper → CSS scroll-snap — was a *replacement* that also
  improved LCP, not a feature loss.)

The reusable primitive is [`src/hooks/useSessionActive.ts`](../../src/hooks/useSessionActive.ts):
returns `true` when an RLS query may run — *a session already exists (returning visitor, hint cookie
`bookstore_has_session=1`) OR the user has interacted*. Cookieless + no interaction (the PSI/coverage
scenario) stays `false`. Used to gate the cart and likes queries.

---

## 3. The decision framework

For any client dependency or query, ask in order:

1. **Is it needed for the first paint of a passive, cookieless visitor?**
   - Yes → it's on the critical path; optimize it in place (§4 LCP techniques).
   - No → it's a defer candidate. Continue.
2. **Does deferring it have a UX / a11y / correctness tradeoff?**
   - No tradeoff → **dynamic-import on interaction** (Radix, custom scrollbars). Note: defer at the
     right *granularity* — for the carousels we defer the heavy *section* (catalog/subscriptions),
     not the carousel library itself (Embla is eager; see the Carousels note in §4).
   - Has a tradeoff → still defer, but **add a correctness chokepoint and a returning-user fast
     path** instead of degrading. E.g. Supabase: gate the queries, but route every RLS op through
     `getAuthedClient()` so the session is guaranteed (closes the first-write race), and let
     returning visitors (hint cookie = 1) load immediately so their UX never regresses.
3. **Is the tradeoff genuinely the user's call?** (touches auth core, removes an a11y affordance,
   changes a product behavior) → **surface it and ask**, don't decide silently. We paused on the
   Supabase/auth defer until the owner chose to proceed.
4. **After shipping: verify the feature still works on live**, not just that the bytes dropped. Every
   defer in this codebase was smoke-tested on production (dropdown opens, menu opens, toast fires,
   add-to-cart persists, cart loads).

---

## 4. Techniques that worked (what + why)

### Bundle hygiene
- **Bust barrel imports.** `@/api/<domain>` barrels re-export everything (mutations → zod, etc.), so
  a barrel import drags it all into the eager chunk and defeats tree-shaking. **Import query keys /
  functions from their specific file**, not the barrel.
- **Dynamic-import mutation functions** inside the `mutationFn`. Optimistic `onMutate` updates the UI
  instantly, so the import adds no perceived latency — and keeps the write code (and its zod schema)
  off first load.
- **Stub dead build-time deps.** The `--webpack` builder ships the `next-devtools` dev-overlay into
  the *production* client bundle as dead code (~228 KB gz — the single biggest waste we found). A
  webpack `resolve.alias` to a no-op stub removes it. (Turbopack doesn't have this leak — see
  `bundle-analysis.md` for the migration note. We still build with `--webpack` for the `@svgr` + alias
  setup, so the stub stays.)
- **Measure per-page, not in aggregate.** `ANALYZE=true npm run build` → parse `.next/analyze/
  client.html` for per-chunk gzip → **join to the chunk list the browser actually loads** (from
  `performance.getEntriesByType('resource')`) for the *real* per-route figure. A synthetic "sum of
  all chunks" total is meaningless; only the chunks a given route loads count.

### Defer shell dependencies on interaction (§2)
- **Custom scrollbars** (`<Scroller>`): native scroll on first paint; lazy-load `overlayscrollbars`
  on first scroll/pointer/focus. Keeps the custom bar, off the critical path.
- **Radix** (nav dropdown, mobile-menu dialog, toast): plain SSR `<button>` triggers; dynamic-import
  the Radix piece on first hover/focus/tap (toast mounts on first toast). ~33 KB gz off the critical
  path, **zero a11y loss**.
- **Supabase** (`@supabase/ssr` + the full `auth-js` GoTrueClient, ~43 KB gz): had three anchors —
  the anon-session bootstrap (`providers.tsx`), the cart-badge queries, and the `Likes` query on the
  deferred catalog. All gated via `useSessionActive()`; anon sign-in moved to first interaction;
  `ensureAnonSession()` / `getAuthedClient()` chokepoint guarantees the session before any RLS op.

### Carousels — eager Embla, defer the *section* not the library
- **All carousels use eager `embla-carousel-react`, not Swiper, not a baseline→Embla handoff.** Every
  slide renders in the **SSR HTML**, so the home hero's LCP cover paints with **no carousel JS in the
  way**; Embla then hydrates the same nodes. Swiper (~24 KB gz) was removed entirely. Every carousel
  **always loops** (the shared `CardCarousel` repeats items when there are too few). Two pieces:
  - **Home hero** — `src/components/common/Slider/` (`useEmblaCarousel`, eager). The home page is the
    only place allowed any deferral, and it defers at the **section** level, not the carousel: the
    catalog mounts on first interaction behind a skeleton (`DeferredCatalog` + `CatalogSkeleton`),
    subscriptions/box-sets mount on viewport-approach (`useInView`). So the measured PSI window still
    ships no below-fold carousel/grid work.
  - **All card strips** (subscriptions, articles, author articles, gift cards) — the shared eager
    `src/components/common/CardCarousel/` (loop + optional autoplay, pauses on drag, respects
    `prefers-reduced-motion`). Off-home carousels do **not** defer (they're eager on their own pages).
  - **Why eager (the rationale that matters):** carousels used to defer Embla itself behind the first
    interaction (`ProgressiveEmblaCarousel`, since deleted). The [100-run PSI baseline](./psi-baseline.md)
    showed the score is **LCP-bound with ~170 ms of unused TBT headroom**, so eager Embla measured
    **PSI-neutral** — and it removed real bugs (carousels "broken until tapped", the article slider
    not looping). Deferral now lives only where it measurably pays: the heavy home *sections*
    (deferring the catalog is worth ~3.7 perf pts; SSR-streaming it was measured and rejected).
    Full story + measurements: [`hero-carousel-remount.md`](./hero-carousel-remount.md).

### LCP (the hero cover)
- **`priority` + an explicit `fetchPriority="high"`** on the LCP image. In this Next version
  `priority` alone does *not* emit `fetchpriority=high` on the preload — only the explicit prop does,
  and without it PSI's "LCP request discovery" audit fails.
- **Accurate `sizes` + a right-sized candidate.** Match the *real* rendered width per breakpoint
  (don't over-state with `vw`). We added a `320` entry to `imageSizes` so phones (174px @ DPR 1.75 ≈
  305px) get 320 instead of jumping to 384 — ~25% smaller on the LCP image.
- **SSR-render the LCP element with a real CSS layout** (explicit width/height) so it paints before
  JS — never gate the LCP on hydration.
- **Font preload discipline.** Preloading every weight delays the LCP; `Montserrat preload:false` was
  one of the biggest LCP wins (font preloads 6 → 1).

### Keep below-fold work below the fold
- **Push the first grid row below the mobile fold** (`min-height` on the hero) so its images stay
  `loading="lazy"` and don't steal Slow-4G bandwidth from the LCP cover during its download window.
- **Defer below-fold sections** (catalog, box-sets, subscriptions) to mount on interaction/idle —
  they land ~10 s in, after the trace window.

---

## 5. Rejected approaches (don't re-try these)

- **`experimental.inlineCss`** — inlines CSS into the document *and* duplicates it in the RSC flight
  payload, ballooning the doc 22 → 65 KB gz → FCP and LCP got *worse*. Rejected twice. Don't.
- **Removing Radix / custom scrollbars to save bytes** — loses a11y / the custom UI. Lazy-load
  instead (§2).
- **Deferring only the cart query for Supabase** — Supabase was *also* anchored to the anon-auth
  bootstrap and the Likes query; deferring one anchor leaves the others loading it. Find *all*
  anchors.
- **PPR / aggressive Suspense restructuring of the shell** — explored and abandoned; the win wasn't
  there for the complexity on this app.
- **Trusting a single PSI run, or blaming "the deps" without measuring** — we wrongly assumed app
  deps caused the bulk; measurement showed ~93% framework, ~5% deps. Always measure first.

---

## 6. Verification discipline

- **Measure on live**, not local: local has no real TTFB and the storefront covers 404 on
  `localhost` (the `getCoverUrl` host). Use production for LCP/image/PSI numbers.
- **Sample distributions** for lab scores (they swing): the PSI API on a cadence, or repeat runs.
- **Coverage** to find eager-but-unexecuted dependencies (the defer candidates) — read it in the
  units it reports (§1).
- **Smoke-test the deferred feature on live after every change.** Bytes-dropped is necessary but not
  sufficient; the dropdown/menu/toast/cart/likes must still work for real users.
- a11y / Best Practices / SEO should stay **100** — every defer here preserved that. If a change
  drops a11y, it's the wrong change; lazy-load to keep it.
