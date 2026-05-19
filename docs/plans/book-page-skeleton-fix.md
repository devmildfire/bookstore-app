# Book Page Skeleton Fix

**Status**: In progress
**Branch**: update
**Tracker**: [book-page-skeleton-fix-tracker.md](./book-page-skeleton-fix-tracker.md)

---

## Goal

Replace the current white-on-dark book detail loading skeleton with a dark
"wave" skeleton that visually fits the page and reflects the real page layout
across every breakpoint, so the loading state does not flash a foreign-looking
placeholder before the page renders.

---

## Problems with the current implementation

1. **Wrong colors.** `src/components/common/Skeleton/Skeleton.module.scss` uses
   `$neutral-200` / `$neutral-100` (light grays) on a `$color-bg-page` (`#121212`)
   background, so skeletons read as harsh white bars.
2. **Wrong layout.** `src/app/books/[slug]/loading.tsx` is a generic
   three-block scaffold (breadcrumb + cover/info grid + similar grid). It
   does not use `book-page-container`, uses CSS Grid where the real page uses
   flex, hardcodes cover width to 360, and skips five real sections
   (`BookEditionTabs`, `BookTrailer`, author block, `BookContext`,
   `BoxSetsSection`).
3. **Narrow wave.** The shimmer uses a 400 px gradient on bars that can be
   1000 px+ wide, so the wave flashes past quickly and is barely noticeable.

---

## Design decisions

- **No theming.** A single dark wave palette baked into the SCSS:
  - base: `$color-panel` (`#1D1D1D`, same shade as the header)
  - highlight: `$neutral-800` (`#262626`)
- **Variant prop** replaces the `rounded` boolean for clarity:
  - `text` (default) → `$radius-sm`
  - `rect` → `$radius-md` (covers, cards)
  - `circle` → `$radius-full`
- **Reduced motion** disables the shimmer animation but keeps the base color.
- **Loading layout mirrors the real page.** Same wrappers (`book-page-container`
  for top sections, `page-container` for `similar`), same flex axis on
  `.coverInfo`, same cover sizing per breakpoint, same section rhythm. This
  prevents any horizontal jump or vertical layout shift when the data resolves.

No external library. The current Skeleton primitive is ~22 lines and gives
us everything we need with these tweaks; pulling in `react-loading-skeleton`
buys nothing we don't already have and conflicts with the project's pinned
deps + supply chain stance.

---

## Files touched

| File | Change |
|---|---|
| `src/components/common/Skeleton/Skeleton.tsx` | Replace `rounded` with `variant`, forward to SCSS class. |
| `src/components/common/Skeleton/Skeleton.module.scss` | Dark gradient, widened/slower wave, `text/rect/circle` classes, `prefers-reduced-motion` guard. |
| `src/app/books/[slug]/loading.tsx` | Rewrite to mirror `page.tsx` section-by-section. |
| `src/app/books/[slug]/loading.module.scss` | Rewrite to mirror `page.module.scss` (mixins, breakpoints, sizing). |
| `src/app/books/layout.tsx` *(new)* | Pass-through layout. Without it, sibling navigation /books → /books/[slug] fires the parent /books/loading.tsx (catalog skeleton) instead of the closer [slug]/loading.tsx. The layout creates an explicit boundary so each segment's loading.tsx scopes only to its own page. |

No changes expected to the catalog skeleton (`src/app/books/loading.tsx`) —
that one already works structurally. The dark recolor of the primitive will
propagate to it automatically. If it ends up looking off, that's a follow-up,
not part of this plan.

---

## Skeleton primitive — final shape

```tsx
// Skeleton.tsx
type Props = {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'rect' | 'circle'
  className?: string
}
```

```scss
// Skeleton.module.scss (shape, not literal)
.skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    $color-panel 25%,
    $neutral-800 50%,
    $color-panel 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
.text   { border-radius: $radius-sm; }
.rect   { border-radius: $radius-md; }
.circle { border-radius: $radius-full; }

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; }
}
```

---

## Book page loading layout — section list

Top-to-bottom, mirroring `src/app/books/[slug]/page.tsx`:

1. `.nav` — single short breadcrumb bar, inside `book-page-container`.
2. `.main` → `.coverInfo` (flex, gap `$space-13` → `$space-8` tablet → column at phone):
   - Cover Skeleton (variant `rect`) sized `500 / 394 / 326 / 280 / 100% max 320` per
     `BookCoverSlider.module.scss`, aspect `2/3`, radius `$radius-lg`.
   - `.info` column — stacked bars matching real rhythm:
     title (~70%, height 50/40/24), author (~40%, 24/20/18),
     meta (~25%, small), thesis (~80%, 2-line), 3 description bars,
     2-item awards row (`131×120 / 99×91 / 80×73`).
3. `BookEditionTabs` placeholder — 3 small pill skeletons + tall panel skeleton.
4. `BookContext` placeholder — section-title bar + 3 context-card skeletons.
5. `BoxSetsSection` placeholder — section-title bar + 3 box-set card skeletons.
6. `.similar` — section-title bar (Cheque-sized) + 4-card grid using the same
   responsive rules as the real `similarGrid` including
   `tablet-small: repeat(2, 1fr)`.

`BookTrailer` is conditional in the real page, and the author block branches
by `isCompilation`. The skeleton renders a single generic author/context-tier
placeholder rather than trying to guess which variant.

---

## Acceptance

- Skeletons read as a dark wave on `#121212`, not white bars.
- At viewport widths 1920 / 1440 / 1200 / 1024 / 767 / 532 / 375, the loading
  state and the loaded page share the same horizontal extent for every section.
- Cover placeholder width matches the real `BookCoverSlider` at each breakpoint.
- Section spacing matches; no vertical layout shift when data resolves.
- With `prefers-reduced-motion: reduce` the wave does not animate.
- `npm run lint` passes.

---

## Out of scope

- Catalog skeleton (`src/app/books/loading.tsx`) — recolor propagates; layout
  changes there are a separate task if needed.
- Light-mode / theming support.
- Replacing the primitive with `react-loading-skeleton` or similar.
