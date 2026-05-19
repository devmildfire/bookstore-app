# Book Page Skeleton Fix — Progress Tracker

**Plan**: [book-page-skeleton-fix.md](./book-page-skeleton-fix.md)
**Branch**: update

Resume work by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met; record blockers
in the Notes section at the bottom.

---

## Steps

- [x] **1. Recolor Skeleton primitive to dark wave**
  File: `src/components/common/Skeleton/Skeleton.module.scss`
  Replace the light gradient with `$color-panel` → `$neutral-800` → `$color-panel`.
  Accept: a `<Skeleton width={200} height={20} />` on `$color-bg-page` reads as
  a dark bar with a slightly lighter sheen sliding across, not a white bar.

- [x] **2. Tune Skeleton wave size and timing**
  File: `src/components/common/Skeleton/Skeleton.module.scss`
  `background-size: 800px 100%`, animation `1.6s ease-in-out`, keyframes
  updated to `-800px / 800px`.
  Accept: on a ~1000 px bar the sheen is clearly visible and moves smoothly.

- [x] **3. Add `variant` prop to Skeleton, drop `rounded`**
  Files: `src/components/common/Skeleton/Skeleton.tsx`, `Skeleton.module.scss`
  `variant?: 'text' | 'rect' | 'circle'`, default `'text'`. Grep the codebase
  for `rounded` usage before changing.
  Accept: TS compiles, no callsite passes `rounded`, all three variants render
  with correct border radius.

- [x] **4. Respect `prefers-reduced-motion`**
  File: `src/components/common/Skeleton/Skeleton.module.scss`
  Wrap animation in `@media (prefers-reduced-motion: reduce) { animation: none; }`.
  Accept: in DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`,
  skeletons render static.

- [x] **5. Rewrite `loading.tsx` to mirror the real page**
  File: `src/app/books/[slug]/loading.tsx`
  Render breadcrumb + cover/info + edition-tabs + context + box-sets + similar,
  in the order and structure of `page.tsx`. Use the new `variant` prop where
  appropriate (cover = `rect`).
  Accept: section order and counts match `page.tsx`; uses Skeleton primitive
  only, no inline literals for sizes that exist as tokens.

- [x] **6. Rewrite `loading.module.scss` with full responsive layout**
  File: `src/app/books/[slug]/loading.module.scss`
  Use `book-page-container` for sections 1–5, `page-container` for similar,
  flex `.coverInfo`, cover widths per `BookCoverSlider.module.scss`, all five
  breakpoints, no hardcoded literals where tokens exist.
  Accept: `npm run lint` passes; sections visually align with the real page
  at every breakpoint.

- [x] **7. Visual verification on dev server across breakpoints**
  Run `npm run dev`, throttle network to expose the loading state, check at
  1920 / 1440 / 1200 / 1024 / 767 / 532 / 375. Verify dark wave is visible
  and pleasant; section widths match; cover size matches; spacing matches;
  no layout shift when data resolves. Also check `prefers-reduced-motion`.
  Accept: all checks pass. If the dev server cannot be started in the working
  environment, record that explicitly here — do not silently tick.

- [x] **9. Add `/books/layout.tsx` to scope sibling Suspense boundaries**
  Without it, sibling navigation /books → /books/[slug] fires the parent
  /books/loading.tsx (catalog skeleton) instead of the closer
  /books/[slug]/loading.tsx. A pass-through layout.tsx that just renders
  `children` separates the boundaries.
  Accept: transition screenshot shows breadcrumb + cover + info + tabs
  placeholder, not the catalog grid.

  **Note**: the pass-through layout fixed client-side nav but NOT a hard
  reload of /books/[slug] — the catalog skeleton still flashed because the
  parent /books/loading.tsx remained a Suspense ancestor. Superseded by
  step 10.

- [x] **10. Move catalog into `(catalog)` route group**
  Move `/books/{page,loading,error}.tsx` + `.module.scss` into
  `/books/(catalog)/`. Delete the pass-through `/books/layout.tsx`. Route
  groups don't affect URLs but DO separate Suspense scopes: `/books` and
  `/books/[slug]` become siblings with no shared `loading.tsx` ancestor.
  Accept: hard reload of `/books/[slug]` under Slow 3G + 4× CPU shows the
  book detail skeleton (breadcrumb + cover + info + tabs), no catalog grid.

- [x] **8. Lint and commit**
  `npm run lint`, fix any issues. Check the diff for `.env` / secrets / files
  >1 MB. Commit with a short imperative slug (no AI attribution). Push
  immediately.

---

## Notes / blockers

- **2026-05-19**: Steps 1–6 implemented. `npm run lint` clean. `npx tsc --noEmit`
  reports one pre-existing error in `src/api/books/getBooks.ts:25` unrelated to
  these files. Steps 7 (browser verification) and 8 (commit + push) are still
  open — they need a human to drive the dev server and confirm the visual
  result at the listed breakpoints before committing.
