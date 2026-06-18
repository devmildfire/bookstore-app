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

## Method / repro

```bash
ANALYZE=true npm run build      # writes .next/analyze/client.html (gated; no effect on normal builds)
# parse window.chartData from client.html for per-module gzip sizes
```
