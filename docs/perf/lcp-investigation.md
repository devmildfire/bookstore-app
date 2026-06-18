# Home LCP investigation — floor vs. home, by time (2026-06-18)

Goal: find where the home's mobile LCP time actually goes. Method: a controlled
A/B — the real home (`/`) vs. a **diagnostic floor page** (`/perf-min`: the normal
`(site)` layout + **one** static SSR cover image, no carousel/catalog/sections),
measured with the **Chrome DevTools MCP** performance trace (by-time call/network
timeline) and **Lighthouse Lantern** (PSI-equivalent simulated throttling). Profile:
412×823 @ DPR 1.75, Slow 4G, Moto-G CPU. Production browser source maps were enabled
(`productionBrowserSourceMaps`) for module attribution.

> Measurement caveat learned the hard way: a local `next start` runs in production
> mode where `dangerouslyAllowLocalIP` is off, so localhost cover images 404/400 and
> the local Next image-optimizer fetches cross-origin covers cold — both poison local
> LCP numbers. **All LCP numbers below are measured against the live site** (edge-cached
> covers, `cf-cache-status: HIT`). Local runs are used only for JS/DOM/bootup, which are
> CPU-bound and representative.

## Headline

**The home's LCP is essentially the app-shell floor.** A static page with one image
and zero content measures the *same* LCP range as the full home:

| Page | LCP (3 Lantern runs) | FCP | Perf |
|---|---|---|---|
| `/perf-min` (floor: layout + 1 image) | **2.3 / 4.7 / 6.2 s** | 1.4 / 3.6 / 3.9 s | 90 / 70 / 62 |
| `/` (home) | **2.7 / 4.9 / 6.4 s** (also 6.3 s w/ maps) | 1.4–4.1 s | 57–88 |

So optimizing the home's *content* (catalog grid, hero Swiper, box-sets,
subscriptions) cannot push LCP below ~2.5–6 s — that floor is set before any home
content is involved. The variance (±~4 s) is inherent: LCP here is **Load-Delay
dominated**, and Load Delay is highly sensitive to the simulated connection state.

## LCP phase breakdown (live, Lantern)

| Phase | `/perf-min` floor | `/` home | Meaning |
|---|---|---|---|
| TTFB | 0.6–1.1 s | 0.45–0.78 s | document delivery (Cloudflare tunnel; home also dynamic SSR) |
| **Load Delay** | 0.25–2.5 s | **3.4–4.4 s** | gap before the cover is credited as loading — connection contention |
| Load Time | 0.9–2.8 s (floor) | ~1 ms (home, edge-cached) | cover download |
| Render Delay | 0.05–0.17 s | **1.1 s** | cover downloaded but not painted — main thread busy |

Two things the home adds over the floor:
1. **Higher Load Delay** — the home's document is bigger (dynamic SSR with the catalog
   grid HTML inline), so the cover's `<link rel=preload>` is discovered later and the
   document occupies the Slow-4G pipe longer.
2. **~1 s Render Delay** — the floor's render delay is ~0.1 s; the home's is ~1.1 s.
   That second is real content hydration (catalog `BookCard`s, hero Swiper).

## What loads, by time — home (live, Lantern observed)

```
   0–880ms   Document (22KB, dynamic SSR)
 799–1169ms  6 FONTS, High pri, ~194KB total  ← compete with the cover
 802–1011ms  4 CSS files (~19KB, render-blocking)
 813–1173ms  LCP cover image (30KB, High, edge-cached)   ← itself fast in raw
1111–1450ms  JS shell: ed9f2dc4 222KB + 2303 85KB + 4bd1b696 62KB + 1134 35KB …
1709–1973ms  14 catalog grid covers (Low pri)
2814–3272ms  later CSS (deferred sections / prefetch)
```

In the **raw** recording the cover finishes at ~1.17 s. **Lantern then re-simulates this
on a single Slow-4G connection with a Moto-G CPU**, where everything above serializes —
the cover ends up *credited* as completing at ~5–6 s (Load Delay ~4.4 s). The
serialization is the whole story.

## The real LCP blockers (ranked)

1. **The app-shell JavaScript — 603 KB gz / 32 chunks — loads on every route.** The
   floor page ships 597 KB; the home only ~6 KB more (deferral works — extra components
   are lazy chunks). Module attribution (source maps):
   - Next/React framework runtime: **~1.87 MB uncompressed** (the bulk; `ed9f2dc4` alone
     is 226 KB gz — react + react-dom + scheduler + zod)
   - `@supabase/auth-js`: **57 KB** (pulled by the Providers' anonymous-auth init)
   - `@floating-ui` + Radix bits: ~25 KB (Header dropdown/popover)
   - **our app code: 18 KB** (everything else is framework/vendor)
   On Slow 4G this 600 KB shares the pipe with the cover; on the CPU it hydrates
   (bootup 2.6 s) and blocks the paint (render delay).
2. **Fonts — 6 files, ~194 KB, High priority** — download in the exact 0.8–1.3 s window
   the cover needs, competing for bandwidth at equal priority. Previously unflagged;
   a significant, reducible competitor (subset/trim weights).
3. **TTFB — 0.6–1.1 s even for the static floor** — the Cloudflare tunnel adds latency;
   the home adds dynamic SSR on top. Static/edge-cached HTML would cut it.
4. **Render Delay ~1 s (home only)** — catalog + hero hydration on the main thread.
5. **14 catalog covers** — already lazy/Low and after the cover; minor.

## Conclusions

- **The LCP is not gated by the home's content; it's gated by the shell + how the cover
  competes on a Slow-4G connection.** The cover itself is fine (30 KB, edge-cached, ~1 ms
  download, preloaded `fetchpriority=high`).
- The biggest reducible levers, in order: **(2) fonts**, **(1) shell JS** (defer the
  Supabase anon-auth init; the framework is largely fixed), **(3) TTFB** (static/edge
  document). The catalog/hero content (what increments A/B targeted) is *not* where the
  LCP time is — those were DOM/TBT/quality wins, not LCP wins.
- The number is intrinsically noisy (±4 s) because Load Delay dominates and is
  connection-state sensitive — chasing a single PSI run is misleading; use medians.

## Deferred / backlog (stored for later)

- **Render-blocking CSS (~750 ms est. savings on PSI).** Even on `/perf-min`, 2 CSS
  files (`d0a58e7f…` 3.2 KB + `0c3fce7b…` 6.8 KB) are render-blocking on the critical
  path. Candidate fixes: inline the tiny critical CSS, or reduce/split. Not yet done —
  deferred by decision (2026-06-18) after the font win.

## CSS strategy: defer-shed YES, inline NO (both tested)

The question "can we inline above-the-fold CSS and defer the rest?" was answered empirically:

- **Render-blocking CSS grows with eager (above-the-fold) components**, not unboundedly. Floor
  (layout chrome) ≈ 8.8 KB on every route; the home adds ~5–7 KB of its eager content CSS.
- **Deferring a component's render does NOT defer its CSS** unless no *eagerly-rendered* component
  imports that CSS module. The increment-B `Deferred*` wrappers imported the section SCSS (for the
  `.section` class), leaking it into render-blocking. **Fix:** move the `.section` wrapper into the
  lazy body; the placeholder uses inline `width/align-self/min-height` only. Result: box-sets +
  subscriptions CSS left the render-blocking bundle (home 15.7→13.7 KB), loading with the body on
  scroll. Full-bleed preserved. ✅ kept.
- **`inlineCss` — tested twice, rejected twice.** Even with the above-fold set shrunk to ~14 KB,
  inlining inflated the home document 22→65 KB gz (inlined CSS + RSC-flight duplication). On Slow-4G
  the document is the critical path, so that pushed **FCP 1.4→2.7 s and LCP ~2→~5 s** (3 runs each)
  — strictly worse. External CSS (parallel, HTTP/3-multiplexed, cacheable) wins here. ❌ reverted.

## Catalog deferral + the TTFB ceiling (2026-06-18)

Deferred the home catalog grid (`NewProducts`) via `dynamic(ssr:false)` mounted on
`requestIdleCallback` — **time-based**, not IntersectionObserver, because the catalog's top
(`ИЗДАНИЯ` heading) is at/above the mobile fold so an observer fires on load. Result: catalog
JS/CSS/images/DOM leave the initial document (render-blocking 13.7→11.5 KB, BookCards out of
initial HTML), and it mounts after the LCP/hydration window. Grid + filters verified on prod.

Home, 5 Lantern passes after: **LCP 1.9 / 4.9 / 1.7 / 4.9 / 1.5 s** (perf 83/59/86/58/88).

**The verdict: we've exhausted the JS/CSS/DOM/image levers.** The home's *good* runs (~1.5–1.9 s)
now match the perf-min floor's good runs. The remaining problem is **variance**: the bad runs
(~4.9 s, FCP ~3 s) are slow-document runs — **TTFB**, from the dynamic SSR (the public queries use
the cookie-reading server Supabase client, forcing `ƒ`) plus the Cloudflare tunnel (even static
perf-min has 0.6–1.1 s TTFB). No amount of JS/CSS/image deferral moves that.

Trade-offs noted: catalog hydration on idle pushed TBT ~300→~500 ms (post-LCP work); and the
above-the-fold `ИЗДАНИЯ` area is empty until the idle mount (acceptable "for now" per decision).

**Remaining lever = TTFB**: make the home statically renderable (cookie-free data client for the
public hero/subscriptions/box-sets queries so the route can be `○`/edge-cached) and/or edge-cache
the HTML at Cloudflare. Structural; touches the data-fetch layer or infra.

## Progress log

- 2026-06-18 — `preload: false` on Montserrat (font preloads 6→1, Chequeblack only).
  Home LCP median ~5–6 s → ~2 s (best run 1.7 s / perf 92); `/perf-min` PSI LCP 5.7 s →
  2.3 s. Biggest single LCP win so far. CLS unchanged (~0.001).

## Method notes / reproducibility

- `/perf-min` is a temporary diagnostic route (noindex), removed after this writeup.
- Lantern (Lighthouse `--throttling-method=simulate`) matches PSI's methodology; the
  Chrome DevTools MCP trace applies real throttling (different absolute numbers, but the
  load order / call timeline are accurate).
- Source maps now shipped in prod (`productionBrowserSourceMaps: true`) for ongoing
  module-level analysis.
