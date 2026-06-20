# Hero carousel & catalog deferral — architecture, the remount bug, and the open simplification

This documents the home page's two perf-motivated mechanisms (hero carousel + deferred catalog),
the **"spring back to the first slide"** bug they produced together, the root cause (measured), the
fix that shipped, and an honest assessment of what here is load-bearing vs. over-engineered.

Read [`README.md`](./README.md) first for the overall perf strategy (PSI lab score is the only
number; defer work behind the first interaction so it lands outside the PSI trace).

---

## 1. The two mechanisms and *why* each exists

### 1a. Hero carousel — native SSR baseline + Embla "hydrate in place"

`src/components/common/Slider/Slider.tsx`.

- The hero is the **LCP element** (the first cover). It is rendered as a plain **CSS scroll-snap
  carousel in the SSR HTML** — every slide is real DOM, the LCP cover paints with **zero JS**, and
  the baseline is swipeable with nothing loaded. It does **not** auto-advance.
- On the **first carousel interaction**, `embla-carousel` **core** (framework-agnostic) is
  `import()`-ed and attached **to the same viewport node** — no component swap, no DOM recreation —
  to add looping + controlled drag. The chunk is therefore off the no-interaction/PSI critical path.
- Why "hydrate in place" rather than swapping to `embla-carousel-react`: an earlier swap approach
  caused a visible blink / layout jump / slide-index reset at the moment of the swap. Attaching to
  the live node preserves the on-screen slide.

**What this buys:** fast LCP (zero-JS hero) + Swiper (~24 KB gz) removed from the critical path.
**What it costs:** the attach handoff (`scrollend` → measure → `EmblaCarousel(viewport, …)`),
`scrollend`-vs-timer logic, hover/pointer preload, and — because of the bug below — remount
resilience. This is the most complex part of the home page.

### 1b. Catalog — `dynamic(ssr:false)` mounted on the first interaction

`src/app/(site)/DeferredCatalog.tsx` (inside `<Suspense>` in `src/app/(site)/page.tsx` →
`HomeCatalog.tsx`).

- The catalog grid is heavy (~370 DOM nodes, ~14 cover images, hydration). It is mounted **only on
  the first real user signal** (`scroll`/`pointerdown`/`keydown`, plus a 10 s fallback timer).
- Why: PSI/Lighthouse loads at the top and **never scrolls or interacts**, so an interaction gate
  keeps the whole grid out of the measured window. (Idle deferral does *not* — PSI waits for idle.)

**What this buys:** the single biggest PSI lever on the home route. **What it costs:** it is the
*trigger* of the remount bug (next section).

---

## 2. The bug — "spring back to the first slide"

**Symptom:** on the **first** swipe after a fresh load, the carousel correctly moves to slide 2,
then instantly snaps back to slide 1. Only the first swipe; every subsequent swipe is fine.

### 2a. What was actually happening (measured, not guessed)

The carousel was **never broken.** Embla attaches correctly and sits on the swiped slide the entire
time. The `<Slider>` React component (or an ancestor) is **unmounted and remounted**, and the fresh
instance is the zero-JS SSR baseline, which starts at slide 1 — that is the "spring back."

Three independent proofs from a Firefox profile + console instrumentation (since removed):

| Evidence | Meaning |
|---|---|
| `embla inited … selectedSnap:1, tx:-412` … unchanged at `+200ms` | Embla is correct on the swiped slide right up until teardown |
| Embla's `destroy()` ran (track transform cleared) — and `destroy()` only runs in the Slider's unmount cleanup | the component **unmounted** |
| viewport `isConnected === false`; a fresh native carousel is on screen at slide 0 | the component **remounted** as the SSR baseline |

### 2b. Root cause: a route-level re-render on the first interaction

Reproduced reliably in a **fresh, no-session Chrome context** (mobile emulation, 4× CPU). The
trigger is **the catalog mounting on the first interaction**, which causes a **Next.js App Router
re-render of the home route** — captured as `history.replaceState('/')` fired from *inside a React
commit* in Next's app-router client (`…/chunks/3794-….js`), plus an RSC re-fetch of `/`. That
re-render recreates the hero subtree.

Isolation table (fresh, no session, deployed build):

| Action | Catalog mounts? | Hero remounts? |
|---|---|---|
| `pointerdown` only (no catalog mount) | no | **no** |
| real scroll (catalog mounts), carousel untouched | yes | **yes** |
| real swipe (catalog mounts + Embla attaches) | yes | **yes**, and Embla had it on slide 2 → *visible* springback |

So: **catalog mount → route re-render → hero subtree remount.** Embla is not the cause; it only
decides whether the remount is *visible* as a springback (it had moved the baseline off slide 1).

Why it is **first-swipe-only**: the route re-render is a one-time consequence of the first
interaction (the catalog mounts once). Why **Chrome never showed it during normal dev**: after the
first load the proxy sets a session cookie, so the anon sign-in — and the first-interaction work it
is part of — does not fire again; and Chrome's reconciliation is more tolerant than Firefox's of
the route re-render landing right after Embla mutated the hero DOM.

**Not pinned (and low value):** the exact Next-internal line that issues the route re-render. In the
synthetic Chrome harness the `replaceState` timing was inconsistent run-to-run, so attributing it to
one specific cause (dynamic-import suspension vs. link-prefetch settle vs. anon-sign-in cookie
change) is unreliable. The *class* — a Next App Router route re-render driven by first-interaction
work — is solid and reproduced.

### 2c. First fix (shipped then removed): remount-resilience hack

The initial fix treated the symptom: a module-scoped `lastSlide = { index, at }` survived the remount,
and a freshly-mounted instance restored the native scroll position to that slide before paint. It
worked, but left the trigger in place and added state to paper over a remount. **Removed in Move 1**
(below) — kept here only as the record of what the rollback checkpoint shipped.

### 2d. Move 1 (current fix): a `memo` guard so the route re-render can't recreate the hero

`Slider.tsx` is wrapped in `memo(Slider, slidesEqual)` with a **content-aware comparator** (equal by
slide `id`). The remount is *hero-only* — the route re-render re-renders the `<Slider>` (handing it a
new `items` array with identical content), and once Embla has imperatively mutated the viewport, that
re-render makes React reconcile the mutated DOM and, in Firefox, recreate it. The comparator bails on
equal-by-id content, so **the route re-render never re-renders the Slider** → React never touches the
live viewport → no recreate, no remount, no springback. A genuine featured-books change still flows
through (ids differ).

Validated in the fresh-no-session Chrome repro that previously reproduced the remount: after the
catalog mounts, the hero wrapper is the **same element** (`sameWrapper: true`), Embla's transform is
intact, and it stays on the swiped slide. The resilience hack (§2c) and all temp instrumentation were
then deleted. Net result: **simpler than the rollback checkpoint, and the bug is gone at its source**
(the route re-render still fires — it's just inert for the hero now).

**PSI:** neutral. 100 cache-busted mobile runs before/after were identical at the center (perf p50
97 / mean 96 both; LCP p50 2401 both; TBT/FCP/CLS within run-to-run noise) — the comparator costs
nothing. Validated 2026-06-20.

---

## 3. Is this over-engineered? Honest assessment + simpler designs

Two pieces are genuinely load-bearing for PSI and should stay:

- **Hero native SSR baseline** — gives the zero-JS LCP. Simple and essential.
- **Catalog deferred behind the first interaction** — the biggest PSI lever on the route.

The complexity worth questioning:

### Option A — drop Embla; native-only hero
Native CSS scroll-snap already gives finger-following swipe + snap. Embla adds **infinite loop** and
controlled drag; dot navigation can use native `scrollTo({behavior:'smooth'})`. Dropping Embla
deletes the `import()`, the attach handoff, `scrollend` logic, and hover preload.
- **PSI impact: none** — Embla is already deferred, so it is not in the PSI trace today. This is a
  *simplicity/robustness* win at *equal* PSI, with a slightly lighter post-interaction experience.
- **Caveat:** the route re-render would still remount a native hero (native scroll resets to slide
  1), so a *trivial* scroll-position resilience is still needed — unless Option B removes the trigger.

### Option B — stop the catalog mount from re-rendering the route
Keep the deferral (keep the PSI win) but prevent it from re-rendering the home route — e.g. bound the
`dynamic(ssr:false)` import with its own `loading` boundary so a suspension can't bubble to the home
`<Suspense>`, or mount the catalog outside that boundary, or defer via a mechanism that doesn't touch
the router tree. If this removes the route re-render, the hero (Embla or native) **never remounts** →
the resilience hack in §2c can be **deleted**.
- **PSI impact: none expected** (the catalog still mounts on interaction). **Needs validation** in
  the fresh-no-session repro that the route re-render is actually gone.

### Option C — SSR-stream the catalog (remove the deferral entirely)
Simplest structurally; removes `DeferredCatalog` and the remount trigger outright.
- **PSI impact: real risk** — the grid re-enters the measured window (TBT from hydrating ~14 cards;
  possible LCP competition). **Must be measured**, not assumed. This trades simplicity for a likely
  PSI regression and is the least aligned with "same or better perf."

**Status:** loop + drag + snap are non-negotiable, so native-only (Option A) is off the table — Embla
stays. **Move 1 is done** via the `memo` guard (§2d): it neutralises the remount without removing
Embla, the deferral, or any function, and it deleted the resilience hack — so the bug is fixed at the
source with *less* code than the checkpoint. This is a cleaner outcome than Option B (it doesn't need
to chase/stop the Next-internal route re-render — it just makes the hero inert to it).

**Still open (Move 2, gated on measurement):** whether the hero's "hydrate-in-place" machinery
(attach handoff / `scrollend` / preload) can be replaced by a plain eager `embla-carousel-react`. The
[2026-06-20 PSI baseline](./psi-baseline.md) shows the score is LCP-bound and TBT has ~170 ms of
unused headroom, so eager Embla is *likely* PSI-neutral — but measure 100 cache-busted runs
before/after before committing. Option C (SSR-stream the catalog) remains the risky one (TBT is
30%-weighted).

---

## 4. How to reproduce / verify (for the next agent)

1. Chrome DevTools, **fresh isolated context** (no cookies → anon sign-in fires), mobile + touch
   viewport, ~4× CPU throttle.
2. Load the home page, let it hydrate, then trigger the **first interaction** (a real scroll mounts
   the catalog). Watch whether the hero wrapper element gets detached (mark it, check `isConnected`).
3. To catch the trigger: patch `history.pushState/replaceState` to log a stack trace; the route
   re-render shows up as `replaceState('/')` from Next's app-router chunk inside a React commit.
4. PSI: compare lab mobile score before/after any change on the live URL (see `psi-baseline.md`).
