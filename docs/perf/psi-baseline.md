# PSI baseline — mobile, home page

Dated snapshots of real **PageSpeed Insights** (Google's servers, not local Lighthouse) for
`https://bookstore-app.mildfire.dev/`, mobile strategy. Lab scores swing run-to-run (TTFB +
Slow-4G), so each snapshot is a **distribution over N runs**, not a single number — see the
[playbook §1](./README.md) on why. Add a new dated section when you want a fresh baseline to compare
against; don't overwrite old ones.

Method: PSI API v5 `runPagespeed`, `strategy=mobile`, service-account OAuth (scope `openid` — see
the PSI API access memory note). Script: `/tmp/psi/run.mjs`.

> **⚠️ The PSI API caches results per URL.** Rapid repeated calls to the *same* URL return the same
> cached analysis (we saw 100 calls return *identical* LCP/FCP/TTI — zero variance, an artifact, not
> a stable site). To sample real run-to-run variance you **must bust the cache with a unique query
> param** per run (`?psi=<salt>-<i>`); the home page ignores unknown params so it renders identically.
> The 100-run snapshot below uses cache-busting; the 10-run one above (spaced ~3 min apart) avoided
> the cache by timing instead.

---

## 2026-06-20 — 100 independent mobile traces (cache-busted)

`n=100`, cache-busted unique URLs, run concurrently. Raw data:
[`data/psi-2026-06-20-mobile-100.jsonl`](./data/psi-2026-06-20-mobile-100.jsonl).

| Metric | min | p10 | **p50** | p90 | max | mean | sd | CV% | budget |
|---|---|---|---|---|---|---|---|---|---|
| **Performance** | 92 | 93 | **97** | 98 | 100 | 96 | 2 | 2% | — |
| **LCP** (ms) | 1727 | 2401 | **2401** | 3151 | 3226 | 2548 | 325 | 13% | < 2500 |
| **FCP** (ms) | 920 | 1203 | **1501** | 1501 | 1652 | 1447 | 166 | 11% | < 1800 |
| **TBT** (ms) | 0 | 5 | **28** | 49 | 163 | 28 | 21 | 75% | < 200 |
| **CLS** | 0 | 0 | **0** | 0 | 0 | 0 | 0 | 0% | < 0.1 |
| **Speed Index** (ms) | 920 | 1203 | **1501** | 2365 | 2749 | 1542 | 346 | 22% | — |
| **TTI** (ms) | 2566 | 2824 | **2921** | 3166 | 3478 | 2945 | 129 | 4% | — |
| **TTFB** (ms) | 4 | 11 | **16** | 55 | 229 | 28 | 36 | 130% | — |

Perf histogram: `92:3  93:12  95:3  96:17  97:55  98:1  99:5  100:4`.
LCP buckets (ms): `<2000:4  2000-2500:55  2500-3000:26  3000-3500:15  >3500:0`.

**Which vitals are stable vs noisy:**

- **Pinned / stable:** CLS (always 0), TTI (CV 4%), and the **score itself is tight** (CV 2%, bounded
  92–100 — never leaves green).
- **Moderate, and they *drive the score*:** LCP (CV 13%) and FCP (CV 11%).
- **Noisy in relative terms but negligible in absolute impact:** TBT (CV 75% but max 163 ms — still
  under the 200 ms "good" line), Speed Index (CV 22%, tracks LCP/FCP), and TTFB (CV 130% but median
  only 16 ms; the 229 ms max is a one-off network spike).

**What moves the score** (perf ≥ 97 vs ≤ 94 runs):

| | LCP | FCP | TBT | SI | TTFB |
|---|---|---|---|---|---|
| perf ≥ 97 (65 runs) | **2361** | 1422 | 28 | 1424 | 23 |
| perf ≤ 94 (15 runs) | **3161** | 1521 | 38 | 2137 | 26 |

**Interpretation — important for the simplification work:**

- **The score is LCP-bound.** The only metric that separates a 97 from a 93 is LCP (and SI, which
  tracks it). FCP/TBT/TTFB barely differ between high and low scorers. To *raise* the median, target
  LCP (the hero cover download + dynamic-SSR/tunnel TTFB), not more JS work.
- **TBT is already deep in the green (median 28 ms, max 163 ms) and is NOT the score driver** — even
  though it carries ~30% of the Lighthouse weight, we're using almost none of that headroom. This
  means the JS-deferral machinery is protecting a metric that has enormous slack. Concretely:
  - **Eager Embla on the hero is very likely PSI-safe** — ~5 KB + a tiny hydration against ~170 ms of
    TBT headroom, and the LCP cover paints from SSR HTML regardless. (Still measure before/after.)
  - **SSR-streaming the catalog (option C in [`hero-carousel-remount.md`](./hero-carousel-remount.md))
    is the genuinely risky one** — hydrating ~14 cards could eat that TBT headroom and, because TBT is
    30%-weighted, drag the score. Avoid unless measured.
  - **Stopping the route re-render (option B) is PSI-neutral** — it changes *what* re-renders, not
    *what loads*.
- Because the lab score is a tight distribution (CV 2%), A/B-testing any change is reliable: run
  100 cache-busted traces before and after and the median shift is trustworthy.

## 2026-06-20 — does deferring the ИЗДАНИЯ catalog matter? (A/B, 100 runs each)

Tested by SSR-streaming the catalog directly (rendering `<NewProducts>` in `HomeCatalog` behind the
existing Suspense, like subscriptions/box-sets) vs the current `DeferredCatalog` interaction-gate.
**Reverted** — the deferral is a real, significant lever:

| Metric | **Deferred** p50 / mean / sd | **SSR-streamed** p50 / mean / sd |
|---|---|---|
| Performance | 97 / **96.4** / 2 | 96 / **92.7** / 6 |
| LCP (ms) | 2401 / 2548 / 325 | 2701 / **3009** / 680  (p90 **4127**) |
| FCP (ms) | 1501 / 1447 | 1651 / 1661 |
| TBT (ms) | 28 / 28 (p90 49) | 30 / **55** (p90 93, max >300) |
| TTI (ms) | 2921 / 2945 | 3379 / **3557** |
| CLS | 0 | 0 |

- **Deferring the catalog is worth ~3.7 mean perf points (96.4 → 92.7)** and, more importantly,
  **consistency**: deferred sd=2 and never dropped below 92; SSR-streamed sd=6 with a long tail of
  bad runs (68, 73, 74, 78, 80…). SSR-streaming regressed LCP (~+460 ms mean, p90 into the "poor"
  >4000 band), TBT (mean doubled, tail past 300 ms), TTI (+600 ms).
- **Why the catalog but not subscriptions/box-sets?** The 14-cover grid + its hydration (BookCard ×
  14, BooksFeed, CatalogControls) is the heavy block; subscriptions/box-sets are lighter and lower.
  The interaction-gate (`DeferredCatalog`) keeps that weight out of the PSI trace entirely (PSI never
  scrolls/interacts). It is **not** over-engineering — it's the second-biggest PSI lever after LCP.
- Decision: **keep `DeferredCatalog`.** Do not SSR-stream the catalog.

## 2026-06-19 — after the interaction-deferral work (Radix + Swiper + Supabase + Likes)

10 runs, ~3-min cadence, 08:27–08:51 UTC.

| Metric | min | median | mean | max | budget | verdict |
|---|---|---|---|---|---|---|
| **Performance** | 94 | **95.5** | 95.8 | 99 | — | consistently green, no bad runs |
| **LCP** | 1.80 s | 2.67 s | 2.63 s | 3.00 s | < 2.5 s | the swing metric — straddles the line |
| **FCP** | 1.35 s | 1.50 s | 1.50 s | 1.65 s | < 1.8 s | rock-steady |
| **TBT** | 15 ms | 36 ms | 35 ms | 54 ms | < 200 ms | excellent (the JS-deferral payoff) |
| **CLS** | 0.001 | 0.001 | 0.001 | 0.001 | < 0.1 | effectively perfect, flat |
| **Speed Index** | 1.35 s | 1.59 s | 1.99 s | 2.75 s | — | good, tracks LCP |

Per run (perf · LCP · FCP · TBT · SI):

```
#1   94 · 3.00s · 1.50s · 15ms · 1.53s
#2   97 · 2.48s · 1.50s · 37ms · 1.53s
#3   94 · 3.00s · 1.50s · 54ms · 2.70s
#4   98 · 2.18s · 1.65s · 17ms · 1.65s
#5   99 · 1.80s · 1.35s · 47ms · 1.35s
#6   94 · 3.00s · 1.50s · 35ms · 2.69s
#7   97 · 2.48s · 1.50s · 44ms · 1.50s
#8   97 · 2.48s · 1.50s · 29ms · 1.53s
#9   94 · 2.86s · 1.50s · 50ms · 2.75s
#10  94 · 3.00s · 1.50s · 25ms · 2.62s
```

**Interpretation:**

- Score never left the green band (94–99) across 10 runs. The one-off 72 seen earlier in the session
  was a TTFB spike, not a regression — the distribution confirms the page is *reliably* fast.
- **LCP is the only thing that moves the score**: every 94 run has LCP = 3.0 s; every 97–99 run has
  LCP ≤ 2.48 s. FCP/TBT/CLS barely vary. LCP median (2.67 s) sits just over the 2.5 s threshold.
- **The LCP swing is TTFB/network-driven, not JS.** FCP is flat at 1.5 s and TBT is tiny (15–54 ms),
  so the bundle/deferral work is doing its job — almost no main-thread blocking. What varies is the
  back half: the LCP cover's download on Slow-4G + the dynamic-SSR TTFB through the Cloudflare tunnel.
  The 3.0 s-LCP runs correlate with higher Speed Index (2.6–2.75 s) — i.e. slower network moments.
- **Next lever is TTFB, not more JS shedding.** To pull the median into 97+ consistently, target the
  dynamic-SSR + tunnel TTFB (caching/edge), not further bundle work — JS cost (TBT) is already
  negligible.
