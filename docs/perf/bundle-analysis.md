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

## Interaction-deferral pass (2026-06-19) — shipped

Acting on the coverage findings above, two of the three remaining items shipped as
**interaction-deferred** (loaded on first interaction, so a no-interaction PSI view ships none):

- **Radix — done (~33 KB gz off the critical path).** Nav dropdown + mobile-menu dialog + global
  toast now dynamic-import on first interaction; the Header renders plain SSR triggers (hover/focus
  warms the dropdown chunk, first tap opens the dialog, first toast mounts the viewport). **No a11y
  loss** — full Radix keyboard/focus behaviour once mounted. Live-verified: dropdown, mobile menu,
  and add-to-cart toast all functional; zero `react-dropdown-menu`/`DismissableLayer`/`react-toast`
  signatures in the home's initial chunks. `Header.tsx` + `NavDropdown.tsx` + `MobileMenu.tsx` +
  `contexts/toast.tsx`.
- **Swiper — done (~24 KB gz off the critical path).** The home hero `Slider` was the only thing
  putting Swiper on the home critical path (the other 4 carousels use Swiper directly and live on
  other routes / the lazy below-fold sections). Replaced with a **native CSS scroll-snap** track:
  all slides render in SSR HTML (LCP cover no longer gated on Swiper hydration), JS only drives
  autoplay (respects `prefers-reduced-motion`) + pagination dots. `BaseSlider` deleted (was unused
  after the swap). Live-verified: 5 slides, dots scroll, autoplay snaps one slide/tick, no swiper
  signature in the home's initial chunks.
- **Supabase (~43 KB) — done.** It had three anchors, all on the no-interaction load: the anon
  sign-in (`providers.tsx`, on mount), the cart-badge queries (`CartProvider`, on mount), and the
  `Likes` query (`LikeButton` in the deferred catalog, ~10 s). All now gate on a shared
  `useSessionActive()` signal — *session-hint cookie = 1 (returning visitor) OR first interaction* —
  plus the cart routes. New chokepoint `ensureAnonSession()`/`getAuthedClient()` (memoized) routes
  every RLS read+write (cart, promo, gift cards, likes) so the session is guaranteed before the op,
  which also closes the first-add-to-cart race (the write awaits the in-flight sign-in). The anon
  sign-in moved from on-mount to first-interaction.
  **Live-verified:** cookieless passive home held 12.5 s loads zero Supabase / zero rest / zero auth
  (the coverage scenario); a fresh visitor whose first action is add-to-cart gets a single anon
  sign-in, the write persists (item shows on `/cart`), and the toast fires; returning visitors
  (cookie = 1) keep an instant, correct badge. a11y/BP/SEO stayed 100.

### Cumulative (home critical-path JS, gzip)

```
~600 KB  session start (with next-devtools)
~309 KB  after devtools/zod/oss/supabase-eager-import shed (measured, browser-joined)
~252 KB  after Radix + Swiper interaction-deferral
~209 KB  after Supabase + Likes defer — for a cookieless, no-interaction visit (the PSI scenario)
~173 KB  React/Next framework floor (~83% of what remains — irreducible)
```

So above the framework floor, the cookieless first load now carries ~36 KB of app code — TanStack
Query + our own components. Supabase, Radix, and Swiper all load on demand (interaction / cart
routes / returning session), never on the passive first paint a lab tool measures.

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

## Chrome Coverage cross-check (2026-06-19) — eager-but-unused

A DevTools Coverage capture on the live home (no scroll, no interaction) — the real PSI scenario —
showed **53% of downloaded JS/CSS unused** (637 K used / 710 K unused, uncompressed). Coverage
counts *un-executed* code, so some "unused" is legitimate (click handlers, error paths). The
*actionable* signal is **chunks loaded eagerly but barely executed** — code on the critical path
for interactions that never happened:

| Chunk | gzip | used | Module | Loaded by |
|---|---|---|---|---|
| `4733` | 12.9 K | **5%** | `@radix-ui/react-popper` | nav dropdown positioning |
| `3294` | 7.9 K | **8%** | `@radix-ui/react-dropdown-menu` | desktop nav dropdown |
| `9483` | 8.5 K | **6%** | `@radix-ui/react-dialog` (+remove-scroll, focus-scope) | mobile menu |
| `7042` | 4.4 K | low | `@radix-ui/react-toast` | global toast provider |
| `9267` | 3.0 K | low | Radix dismissable-layer/portal/collection | shared |
| `1134`+`44530001` | ~25 K | **~24%** | `@supabase/ssr` + `@supabase/auth-js` | cart query + anon auth |

**Finding:** ~33 K gzip of **Radix** hydrates eagerly though no dropdown/menu/toast was ever
opened (94% dead on a no-interaction view), because `Header.tsx` imports
`@radix-ui/react-dropdown-menu` + `@radix-ui/react-dialog` at module top and `Header` is
always-rendered chrome; the Toast provider is mounted globally in `providers.tsx`. And the full
Supabase `GoTrueClient` (OAuth / Ethereum / Solana / OTP / MFA / passkey — none used on the
storefront) ships for the **cart-badge query that runs client-side on mount**.

**Corrected recommendation (supersedes the "remove Radix, lose a11y" framing above):** the fix is
**not to remove Radix — it's to stop loading it eagerly.** Dynamic-import each piece on first
interaction (trigger is plain SSR HTML; Radix mounts on hover/focus/tap), keeping full a11y. A
no-interaction visitor — i.e. the Lighthouse trace — downloads none of it. Same lever as the lazy
`<Scroller>`. Supabase/TanStack (~50 K together) are anchored to the on-mount cart query; deferring
that is the only way to move them, at the cost of the cart badge count on first paint.

## Method / repro

```bash
ANALYZE=true npm run build      # writes .next/analyze/client.html (gated; no effect on normal builds)
# parse window.chartData from client.html for per-module gzip sizes, then join to the
# browser-loaded chunk list (performance.getEntriesByType('resource')) for the real per-page figure
```
