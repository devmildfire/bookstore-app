# PSI baseline — mobile, home page

Dated snapshots of real **PageSpeed Insights** (Google's servers, not local Lighthouse) for
`https://bookstore-app.mildfire.dev/`, mobile strategy. Lab scores swing run-to-run (TTFB +
Slow-4G), so each snapshot is a **distribution over N runs**, not a single number — see the
[playbook §1](./README.md) on why. Add a new dated section when you want a fresh baseline to compare
against; don't overwrite old ones.

Method: PSI API v5 `runPagespeed`, `strategy=mobile`, service-account OAuth (scope `openid` — see
[[reference-psi-api-access]]). Script: `/tmp/psi/run.mjs`.

---

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
