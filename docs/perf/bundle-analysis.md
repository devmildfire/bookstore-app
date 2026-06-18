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
| − overlayscrollbars (lazy `<Scroller>`) | **299 KB** | native scroll → custom bar on first interaction |

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

## Method / repro

```bash
ANALYZE=true npm run build      # writes .next/analyze/client.html (gated; no effect on normal builds)
# parse window.chartData from client.html for per-module gzip sizes
```
