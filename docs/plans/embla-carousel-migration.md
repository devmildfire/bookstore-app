# Embla carousel migration and progressive enhancement

> **⚠️ SUPERSEDED (2026-06-20).** This plan's end-state — a CSS-baseline → interaction-gated Embla
> handoff (`ProgressiveEmblaCarousel`), "no eager Embla on the home route" — was **later reverted to
> eager Embla everywhere**. The 100-run PSI baseline showed the score is LCP-bound with large TBT
> headroom, so eager Embla measured PSI-neutral, is much simpler, and fixed real bugs
> (carousels "broken until tapped", sliders not looping). `ProgressiveEmblaCarousel` was deleted; the
> hero uses `Slider/` and the card strips use the shared `CardCarousel/`, both eager. Deferral now
> lives only at the home *section* level. This file is kept as a historical record of the Swiper→Embla
> removal. **Current architecture + rationale: [`../perf/hero-carousel-remount.md`](../perf/hero-carousel-remount.md).**

Status: **complete** (started + finished 2026-06-19); **superseded 2026-06-20** (see banner above).

The app currently uses two carousel approaches:

- `src/components/common/Slider/` — home hero, native CSS scroll-snap with a small custom autoplay controller. This was intentionally built without Swiper because Swiper increased the home critical-path JS and hurt LCP.
- Four Swiper callsites — subscriptions, gift cards, related articles, and author articles.

The goal is to standardize on **Embla** while preserving the home hero's current LCP guarantees:
the first slide must render from SSR/CSS, with no carousel-library code in the initial bundle.

Reference docs:
- Embla React setup: https://www.embla-carousel.com/get-started/react/
- Embla SSR guide: https://www.embla-carousel.com/guides/server-side-rendering/
- Embla options API: https://www.embla-carousel.com/api/options/

## Decisions

- **Use Embla, not Swiper.** If Embla is introduced, Swiper should be removed once every Swiper callsite is migrated.
- **No eager Embla on the home route.** Embla must be dynamically imported only after user carousel intent.
- **Keep passive hero autoplay before enhancement.** A visitor who never interacts should still see slides advance.
- **Any user carousel interaction stops autoplay.** A swipe/tap/dot click should never be followed by an immediate timer-driven second slide change.
- **Hero loop support is required after enhancement.** The current lack of looping is a primary reason to introduce Embla.
- **Use one enhancement model everywhere.** Carousel-library JS loads after user interaction, not on idle or timer.
- **Do not enhance because autoplay reached the last slide.** Timer-based enhancement would put library JS back into passive sessions and can regress lab performance.
- **Dot click/tap counts as interaction.** Hover/focus/pointer/touch can also warm or load the Embla chunk. Keyboard support is still useful for accessibility, but mobile UX is the primary concern.

## Current carousel inventory

| Area | File | Current approach | Notes |
|------|------|------------------|-------|
| Home hero | `src/components/common/Slider/Slider.tsx` | CSS scroll-snap + custom autoplay | LCP-critical. Must keep SSR/CSS first paint. Needs loop after interaction and autoplay stop on interaction. |
| Subscriptions mobile | `src/components/subscriptions/SubscriptionsSection/SubscriptionsCarousel.tsx` | Swiper | Mobile-only. Already dynamically mounted below the fold. |
| Gift cards | `src/components/giftCards/GiftCardStorefront/GiftCardCarousel.tsx` | Swiper | Mobile carousel. No autoplay. |
| Related articles | `src/components/articles/ArticleCarousel/ArticleCarousel.tsx` | Swiper + Autoplay | Full-bleed article strip. |
| Author articles | `src/components/authors/AuthorArticlesCarousel/AuthorArticlesCarousel.tsx` | Swiper + Autoplay | Full-bleed article strip, repeats short article lists for continuous movement. |

## Architecture

### Baseline

Every carousel keeps a no-library baseline:

- SSR renders the real slide markup.
- CSS defines stable slide sizes and spacing.
- The home hero keeps its current first-slide image priority and `fetchPriority="high"` behavior.
- The baseline can use native scroll-snap and the current lightweight timer for passive hero autoplay.

### Enhancement trigger

Enhancement is allowed only after carousel-specific user intent:

- `pointerdown` / `touchstart` on the carousel viewport.
- Dot click or tap.
- `pointerenter` can prefetch/warm the chunk on hover-capable devices.
- `focusin` and arrow keys can trigger enhancement for accessibility.

Non-triggers:

- `requestIdleCallback`
- `setTimeout` / `setInterval`
- autoplay reaching the last slide
- `IntersectionObserver` visibility alone

### Embla layer

The enhanced component should:

- be imported with `next/dynamic` or `import()` from a small baseline wrapper;
- initialize from the current visible slide index;
- enable `loop` where the UX expects wraparound;
- stop autoplay permanently for that carousel session once the user interacts;
- preserve the same DOM dimensions during the baseline-to-Embla swap;
- update dots from Embla `select` events;
- destroy cleanly on unmount.

For the home hero, avoid Embla SSR mode unless it proves necessary. The existing CSS baseline is already the SSR source of truth. If we use Embla's SSR support later, its constraints matter: slide widths must be percentage-based, spacing must use padding rather than unsupported gap/margin assumptions, and the `ssr` option must match CSS exactly.

## Implementation plan

### Phase 1 — Dependency and measurement baseline

1. Capture current bundle and runtime baselines:
   - `npm run lint`
   - `npm run build` or the repo's analyzer flow if comparing bundle size
   - mobile screenshots for home hero and each carousel page
2. Add exact-pinned Embla dependencies:
   - `embla-carousel-react`
   - `embla-carousel-autoplay` only if the custom autoplay controller is not enough for non-hero carousels. It was not needed in the first implementation.
3. Do not import Embla from any eagerly loaded component.

### Phase 2 — Shared progressive-enhancement primitive

Create a small shared helper or component under `src/components/common/` for the recurring pattern:

- baseline scroll-snap markup;
- active index state;
- interaction-triggered dynamic import;
- dot controls;
- autoplay stop-on-interaction;
- optional loop after enhancement.

This should not become a large generic abstraction before the use cases prove it. A focused hero implementation first is acceptable, then extract the common pieces that repeat in the Swiper migrations.

### Phase 3 — Home hero

1. Keep the current `Slider` baseline markup and styles.
2. Add enhancement trigger handlers to the baseline wrapper and dot buttons.
3. On first user intent:
   - stop the baseline autoplay;
   - record the current slide index;
   - dynamically load the Embla-enhanced hero implementation;
   - initialize Embla at that index with `loop: true`.
4. Ensure a swipe produces exactly one user-driven movement and no follow-up timer movement.
5. Verify:
   - first slide still paints before Embla loads;
   - no Embla chunk in the passive home initial bundle;
   - no CLS on enhancement;
   - loop works forward and backward after interaction;
   - dots remain accurate.

### Phase 4 — Migrate non-home Swiper callsites

Migrate callsites one by one to the same interaction-gated Embla model.

For no-autoplay carousels:

- `SubscriptionsCarousel`
- `GiftCardCarousel`

The baseline can be native scroll-snap with dots if needed. Embla loads on touch/drag/dot interaction.

For autoplay article carousels:

- `ArticleCarousel`
- `AuthorArticlesCarousel`

Use the same rule as the hero: passive baseline may animate without library code, but the first user interaction stops autoplay and loads Embla for controlled looping. If CSS/passive autoplay becomes too complex for these strips, prefer no passive autoplay over eager library loading.

### Phase 5 — Remove Swiper

After all Swiper callsites are gone:

1. Remove `swiper` from `package.json`.
2. Update `package-lock.json`.
3. Search for stale imports:
   - `rg "swiper|Swiper|SwiperSlide|Autoplay" src package.json package-lock.json`
4. Run lint and build.
5. Compare bundle output to confirm Swiper no longer appears in client chunks.

### Phase 6 — Verification and docs

1. Mobile screenshots:
   - home `/`
   - gift cards page
   - subscription section
   - article detail related carousel
   - author detail article carousel
2. Interaction smoke tests:
   - swipe one slide; no timer double-advance;
   - dot tap loads/enhances and selects intended slide;
   - loop from last to first and first to last;
   - autoplay respects reduced motion;
   - hover/focus preloading does not break touch behavior.
3. Performance checks:
   - no Embla chunk on passive home first load;
   - LCP image remains the first hero cover;
   - CLS remains effectively zero;
   - compare analyzer output before/after Swiper removal.
4. Update `docs/perf/README.md` and related investigation docs if measurement changes materially.

## Tracker

Legend: ✅ done · 🟡 in progress · ⬜ not started · ⚠️ blocked

| Step | Status | Notes |
|------|--------|-------|
| Baseline bundle/screenshots captured | ✅ | Existing Swiper callsites and home slider structure inventoried before implementation. |
| Embla dependencies added with exact versions | ✅ | `embla-carousel-react` pinned to `8.6.0`; Embla imports live outside baseline carousel files. |
| Shared enhancement trigger pattern designed | ✅ | `ProgressiveEmblaCarousel` handles non-hero interaction-gated enhancement; hero keeps a focused implementation. |
| Home hero baseline autoplay stop-on-interaction implemented | ✅ | Browser check: dot tap loaded Embla and slide stayed selected after the old autoplay interval. |
| Home hero Embla enhancement implemented | ✅ | Dynamic import after intent with `loop: true`. |
| Home passive load verified free of Embla JS | ✅ | Browser resource check before interaction returned no Embla chunks; dot tap loaded lazy chunks. |
| `SubscriptionsCarousel` migrated from Swiper | ✅ | Mobile-only carousel now uses `ProgressiveEmblaCarousel`. |
| `GiftCardCarousel` migrated from Swiper | ✅ | Mobile carousel now uses `ProgressiveEmblaCarousel`. |
| `ArticleCarousel` migrated from Swiper | ✅ | Baseline custom autoplay, interaction-gated Embla loop. |
| `AuthorArticlesCarousel` migrated from Swiper | ✅ | Short-list repetition preserved; baseline custom autoplay, interaction-gated Embla loop. |
| Swiper dependency removed | ✅ | `swiper` removed from `package.json` / lockfile. |
| Lint/build pass | ✅ | `npm run lint` clean; `npm run build` compiles with Swiper gone + Embla in (verified 2026-06-19). |
| Mobile screenshots and interaction smoke tests complete | ✅ | Home hero (412px): passive load ships **no Embla chunk**; dot tap lazily loads 2 Embla chunks → loop works (dot 3 → dot 0 wraps), dots track Embla `select`, autoplay stops. Gift-cards (free-scroll variant): passive baseline, swipe lazily loads Embla + enhances. Both variants confirmed. |
| Performance docs updated if needed | ✅ | `docs/perf/bundle-analysis.md` + `README.md` updated: hero is CSS scroll-snap baseline + interaction-gated Embla (loop); Swiper removed from all 4 other callsites (now `ProgressiveEmblaCarousel`); no carousel-library JS on the passive home load. |

## Risks

- **Accidental eager import.** Importing Embla from `Slider.tsx` or another eager route component would put it back into the critical bundle. Keep imports inside dynamic modules or event-triggered `import()`.
- **Hydration or swap shift.** If the enhanced DOM differs materially from the baseline DOM, layout can jump. Use the same slide dimensions and stable wrappers.
- **Autoplay race.** The first user interaction must synchronously stop baseline autoplay before loading Embla.
- **Loop clones and image loading.** Embla loop behavior may duplicate or reposition slides. Confirm it does not cause offscreen hero covers to become high-priority image requests.
- **Over-abstracting too early.** The hero and article strips have different needs. Extract shared pieces only after the second migration proves the repeated shape.
