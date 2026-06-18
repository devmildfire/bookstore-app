# Home LCP — Chrome DevTools trace findings (2026-06-18)

Captured with the Chrome DevTools MCP (`emulate` + `performance_start_trace` +
`performance_analyze_insight`).

## CPU throttle calibration (this matters — earlier numbers were wrong)

PSI runs Lighthouse on a **weak runner** (benchmarkIndex ≈ 701) and applies only **1.2×**
to reach the Moto G Power target (≈ 701 / 1.2 ≈ **584**). That **1.2× is specific to PSI's
runner, NOT to this desktop.** This machine's benchmarkIndex ≈ **2,150**, so to emulate the
Moto G Power here the applied multiplier is `2150 / 584 ≈ **3.7×**` (the Lighthouse CLI
independently picks **4×**). Tracing at 1.2× under-throttles by ~3× and reports an
artificially fast LCP — that earlier "917 ms / page is fast" reading was the mistake.

**Correct profile: 412×823 @ DPR 1.75, CPU 3.7×, Slow 4G.**

## Headline

- **Warm steady-state LCP ≈ 1.25 s, CLS 0** at the correct device profile. Good, not "fast".
- The earlier **5.6 s** readings were a **cold** state — Cloudflare edge miss on `/_next/image`
  + cold dynamic SSR (high TTFB). The earlier **917 ms** was under-throttled (1.2×). The truth
  is in between and depends entirely on warm vs cold.
- **PSI's 3.3–7.7 s is Lighthouse's Lantern *simulation*** amplifying the load-delay phase plus
  hitting cold states — not a steady-state measurement. But the cold-state tail is real and is
  the one structural lever left (see below).

## LCP breakdown (warm, 3.7×, Slow 4G)

LCP element = the hero cover `IMG.Slider_cover` (`murlo.jpg`), so on the Swiper build the cover
**is** the LCP.

| Phase | Time | Share | Note |
|---|---|---|---|
| TTFB | 500 ms | 40% | dynamic (ƒ) SSR + Slow-4G RTT |
| Load delay | 663 ms | 53% | document streams on Slow-4G before the preload fires |
| Load duration | 0.5 ms | 0% | cover is edge-cached (`cf-cache HIT`), 26–30 KB |
| Render delay | 92 ms | 7% | — |

The image is **not** the bottleneck — it's `fetchpriority=high`, edge-cached, and downloads in
0.5 ms. The cost is getting the preload *discovered*: the load-delay is the document arriving
over Slow-4G before the `<link rel=preload>` can fire.

## Image format / edge cache (verified on the live origin)

- Fresh build serves **WebP** (26 KB) to Chrome, **JPEG** (30 KB) fallback to non-webp
  browsers. `formats: ['image/webp']` is live; **AVIF is gone** (an AVIF response = a stale
  pre-config build/edge entry).
- Response still carries `vary: Accept`, and the **free Cloudflare plan ignores Vary in the
  cache key** — so whichever of {webp, jpeg} is cached first at an edge node is served to all
  Accept headers there. With webp-only the collapse is now webp(26 KB)↔jpeg(30 KB) — tiny size
  delta, ~97%+ webp support — so it is no longer a perf problem, just non-determinism.

## Remaining levers

1. **Cold TTFB (the real one).** The home is dynamic (`ƒ`) because `<HomeCatalog>` reads
   `searchParams`. A cold render inflates TTFB, which Lantern amplifies into the scary PSI
   number. Making the shell statically cacheable (**PPR / `cacheComponents`**, streaming the
   filtered catalog behind Suspense) would serve a cached HTML doc → low, consistent TTFB.
   This is the only change that meaningfully moves the Lantern LCP.
2. **Load delay** (preload discovery) is gated by document streaming on Slow-4G. `inlineCss`
   revert already helped (doc 0.66→0.21 MB). Further gains need a smaller head or Early Hints
   that PSI honors (it doesn't act on 103) — diminishing.

## Method note

DevTools traces *apply* throttling (real, deterministic); PSI *simulates* (Lantern). Absolute
LCP differs, but at the calibrated 3.7× the load order / critical chain / phase breakdown are
accurate and directly comparable run-to-run.
