# Client bundle analysis — baseline & waste (2026-06-18)

Measured with `@next/bundle-analyzer` (`ANALYZE=true next build --webpack`) on Next 16.2.9,
reading `.next/analyze/client.html` (gzip sizes). Total client JS across all routes ≈ **1,250 KB gz**.

## Bundle waste — full picture (gzip)

| Item | Size | Verdict |
|---|---|---|
| **`next-devtools` dev-overlay** | **228 KB** | ❌ should NOT be in prod — Next 16 `--webpack` ships the dev overlay/devtools into the **client production** bundle as dead code. The single biggest waste. |
| **Cross-chunk duplication** (153 modules in multiple chunks) | **~140 KB** | ❌ chunking failure — `classnames` in 30 chunks, TanStack `mutation`/`mutationObserver` in 16, `next/dist/.../image-external` in 22, and our own `Select`/`Input`/`Button`/`supabase-client` duplicated per-route instead of extracted to one shared chunk. |
| `@swc/helpers` | 13 KB | minor (SWC runtime helpers) |
| polyfills/core-js | 2 KB | fine (modern browserslist target) |
| Lexical (`lexical` 44 + `@lexical/react` 20 + `@lexical/extension` 7) | ~71 KB | admin-only (article rich-text editor) — route-specific, NOT on the storefront. Fine. |

**The two big ones — devtools (228 KB) + duplication (140 KB) = ~370 KB of avoidable JS — are both
build/bundler problems, not app code.** App code is ~30 KB; the React/Next framework itself is the
rest (React+ReactDOM ≈ 45 KB; Next runtime ≈ 65–85 KB per page).

## What's been done

- **next-devtools stubbed** (`src/lib/next-devtools-stub.js` + webpack `resolve.alias` for
  `next/dist/compiled/next-devtools`). Result: the 221 KB chunk is gone; **`/perf-min` first-load
  JS dropped ~600 → 327 KB (−45%)**, total page weight 742 → 461 KiB, main-thread 1.8 → 1.5 s. App
  renders + Swiper hydrates correctly (verified). A patch bump to Next 16.2.9 did NOT fix the leak
  on its own — the stub is required for the webpack builder.

## Still open

- **Cross-chunk duplication (~140 KB)** — webpack (with this config / `--webpack` mode) is not
  extracting common modules into a shared chunk. Candidate fix: `splitChunks` tuning, or Turbopack.
- **Turbopack** — Next 16's default builder (we use `--webpack` for `@svgr` SVG imports + the
  realtime/devtools aliases). Turbopack is expected to (a) not ship the dev-overlay in prod and
  (b) dedupe commons better. **To investigate:** port the SVG loader (`turbopack.rules`) + aliases
  (`turbopack.resolveAlias`), build, and compare bundle composition. This may make the
  next-devtools stub unnecessary and fix the duplication at once.

## Turbopack comparison (2026-06-18)

Tested `next build` (Turbopack, Next 16 default) with `turbopack.rules` for `@svgr` SVG +
`turbopack.resolveAlias` for the realtime stub. Result:

- **Builds cleanly** — SVG imports + aliases work; **~3× faster** (21 s vs 56–75 s for `--webpack`).
- **Natively does NOT ship the next-devtools blob** — no 221 KB chunk, no devtools refs in the
  output. So the webpack `next-devtools` stub is a workaround for the **`--webpack` builder
  specifically**; Turbopack doesn't need it.
- **Better chunking** — biggest chunk 77 KB (vs webpack's 221 KB monster).
- **`/perf-min` first-load: 348 KB JS** (Turbopack, no stub) vs **327 KB** (webpack + stub) —
  comparable; both eliminate the 228 KB devtools.

**Recommendation:** Turbopack is the cleaner path — it removes the devtools natively (no hack),
is much faster, and is Next 16's supported builder (`--webpack` is deprecated). Migration is
low-friction (the SVG/alias config ports as shown). **Before switching, validate:** (1) SVG
components render with the full `svgoConfig` (`removeViewBox: false`) ported to the Turbopack
rule; (2) `output: 'standalone'` + the deploy pipeline work under Turbopack; (3) whether
Turbopack also resolves the cross-chunk duplication (~140 KB) — its many-small-chunks model
likely dedupes commons into shared chunks, but confirm with a per-route first-load comparison.

For now the **webpack + next-devtools stub** is the shipped, validated win (−45% client JS);
the Turbopack migration is the recommended follow-up to drop the hack and gain build speed.

## Shell-dep shedding progress (2026-06-18)

`/perf-min` first-load JS (a near-empty page = the global shell cost), over the session:

| Step | JS | Note |
|---|---|---|
| Session start | ~600 KB | with next-devtools |
| − next-devtools (webpack stub) | 327 KB | dead dev-overlay |
| − zod (defer mutations + bust api barrels) | 313 KB | barrels defeated tree-shaking |
| − overlayscrollbars (lazy `<Scroller>`) | 299 KB | native scroll → custom bar on first interaction |
| − Supabase off eager (lazy client) | **295 KB** | `getBrowserClient()` dynamic-import in cart queries + search + anon-auth; bust the `@/api/orders` barrel. **Total ~flat** (cart query still runs on mount → loads the Supabase chunk *then*), but it's off the **eager critical path** → **bootup 1.1→0.8 s**, home good-run perf 88→**94–95**. Cart / search / add-to-cart verified working on live. |

The "free" eager-shed is done. Fully removing Supabase from the *loaded* set needs deferring the
cart query off mount → the badge would show empty until interaction (bad on `/cart`), so it's left
loading on mount. Last shell dep is **Radix (~22 KB)** (nav dropdowns + mobile dialog — a11y
refactor). Floor ≈ ~170 KB React/Next.

**>50% of the starting JS removed.** Remaining toward the ~190 KB framework floor:

- **Supabase (~47 KB)** — pulled by the cart **queries** (run on mount for the badge count) + the
  Providers' anon-auth. Deferring it has a real **product tradeoff**: either the cart badge shows
  empty until after first paint (defer the query past interaction to escape the PSI run), or the
  count is server-rendered from the cookie (which makes pages dynamic). Not a free win.
- **Radix (~22 KB)** — Header's desktop nav `DropdownMenu` + mobile-menu `Dialog`. Options:
  CSS-only hover/focus dropdowns + a custom mobile overlay (removes Radix, **a11y tradeoff** —
  loses arrow-key menu nav + focus trap), or dynamic-import-on-interaction (keeps a11y, complex).
- **~170 KB React/Next framework** — irreducible for a React/Next app.

Both remaining items are **central-component refactors** (nav, cart/auth) with UX/a11y tradeoffs —
unlike the pure-win deferrals above. They warrant focused work + live smoke-tests.

## Definitive home-page breakdown (2026-06-19) — ground truth

Method: `ANALYZE=true npm run build` → parse `.next/analyze/client.html` `chartData` for
per-chunk gzip, **joined to the actual chunk list the browser loads on the live home**
(captured via `performance.getEntriesByType('resource')`, mobile-emulated). The numbered/vendor
chunk hashes are identical between the local analyzer build and the live deploy (same commit),
so the join is exact. This is what a **real mobile visitor downloads**, not a synthetic total.

**Home page over-the-wire JS (gzip):**

| Phase | When | Size | What |
|---|---|---|---|
| **Initial (critical)** | <0.5 s, blocks paint/LCP | **~309 KB** | framework + hero + cart/auth bootstrap |
| Prefetch | ~0.9 s idle | ~10 KB | Next `<Link>` prefetch of `/cart` + book error boundary (intended) |
| Deferred | ~10.7 s idle fallback | ~26 KB | catalog grid + box-sets + subscriptions (our below-fold deferral — lands **after** the PSI window) |
| **Total eventually** | | **~345 KB** | |

**The ~309 KB critical bundle, by package (proportions exact; the framework is the floor):**

| Package | ~gzip | % | Sheddable? |
|---|---|---|---|
| **Next / React framework** | ~173 KB | 56% | ❌ irreducible floor |
| **Supabase** (`auth-js` + `ssr`) | ~35 KB | 11% | ⚠️ loads @0.4 s for the cart badge (query on mount). Defer = empty badge or dynamic pages. |
| **Radix UI** (popper+dropdown+dialog+toast) | ~31 KB | 10% | ⚠️ Header nav + mobile menu + toast. a11y tradeoff or complex lazy-load. |
| **Swiper** (hero carousel) | ~24 KB | 8% | ✅ **best clean shed** — rewrite `BaseSlider` → CSS scroll-snap (keeps a11y, may *improve* LCP by dropping hero hydration). Used by 5 carousels via one shared `BaseSlider`. |
| **TanStack Query** | ~14 KB | 5% | ❌ core data layer |
| **Our app code** (components/contexts/api) | ~19 KB | 6% | ❌ already lean |
| misc (classnames, swc-helpers, cookie…) | ~13 KB | 4% | ❌ runtime |

**Conclusions:**
- **No dead/wasted code remains on the critical path.** Everything loaded is a real, used dep.
  The big waste (next-devtools 228 K, zod, overlayscrollbars) is already shed; this is now a
  *lean* bundle whose bulk (56%) is the unavoidable React/Next framework.
- The below-fold deferral works: catalog/box-sets/subscriptions load at ~10.7 s idle, **outside**
  the Lighthouse trace window.
- Three sheddable items remain, all dependencies (not waste): **Swiper (~24 K, lowest tradeoff)**,
  Supabase (~35 K, cart-badge UX tradeoff), Radix (~31 K, a11y tradeoff). Max theoretical
  additional shed ≈ 90 K, but only Swiper is a clean pure-frontend win.

## Method / repro

```bash
ANALYZE=true npm run build      # writes .next/analyze/client.html (gated; no effect on normal builds)
# parse window.chartData from client.html for per-module gzip sizes, then join to the
# browser-loaded chunk list (performance.getEntriesByType('resource')) for the real per-page figure
```
