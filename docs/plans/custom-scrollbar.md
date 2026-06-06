# Custom scrollbar (`<Scroller>`)

**Status:** Implementation complete; verified in Chrome. Created 2026-06-06. Updated 2026-06-06.

> Verification fix (2026-06-06): the theme was defined as `.os-theme-chtivo`, but
> OverlayScrollbars applies that class **onto** the `.os-scrollbar` element and its
> base CSS sets the same vars on `.os-scrollbar` with equal specificity — so the
> bar rendered at **0px** (invisible). Corrected to `.os-scrollbar.os-theme-chtivo`
> (and the touch-hide rule likewise). Thumb now renders (10px track, 4px rounded
> grey handle). Cross-browser (Firefox/Safari) QA still pending.

Today every scrollable surface uses the browser's native scrollbar, so the UI
looks different per browser — Chrome paints a bulky always-on bar, Firefox an
overlay/near-invisible one, Safari yet another. We want **one** scrollbar look
across browsers: a **thin grey track with a rounded grey thumb**, appearing only
when a container can actually scroll (e.g. the long awards/books lists in search
on the main page, long text boxes, dropdown menus).

Reference look: a faint thin track line + a small rounded grey thumb (proportional
to content) on dark surfaces.

---

## Locked decisions (from scoping Q&A, 2026-06-06)

| Topic | Decision |
|---|---|
| Scope | **Inner overflow containers only.** The main browser window keeps its native scrollbar (no `<body>` wrapping → no impact on the sticky header, modals, position:fixed, or scroll-to-anchor). |
| Library | **OverlayScrollbars** v2 + **`overlayscrollbars-react`**. MIT, zero-dependency, themeable, official React wrapper. Pinned to exact versions (no `^`/`~`). |
| Visibility | **Always visible while the container overflows** (`autoHide: 'never'`); fully hidden when content fits. |
| Thumb | **Proportional, fully-rounded** grey thumb on a thin grey track. (For long content it renders as a small rounded nub ≈ the mock; it also conveys how much is left.) |
| Application | **Opt-in `<Scroller>` wrapper** component placed around chosen containers. No global auto-apply. |
| Axes | **Both** vertical and horizontal. |
| Touch | **Native touch scrolling**; the custom bar is hidden on coarse-pointer/touch (`@media (hover: none) and (pointer: coarse)`), shown on pointer/desktop. |

---

## Architecture

### Component — `src/components/common/Scroller/`

A thin client wrapper around `OverlayScrollbarsComponent`:

```tsx
'use client'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/overlayscrollbars.css' // base styles (or import once globally)
import styles from './Scroller.module.scss'

type Props = {
  children: React.ReactNode
  className?: string          // applied to the host (set max-height/width here)
  /** Restrict to one axis if needed; default scrolls whichever overflows. */
  axis?: 'both' | 'vertical' | 'horizontal'
}
```

- Options: `{ scrollbars: { theme: 'os-theme-chtivo', autoHide: 'never', clickScroll: true }, overflow: {...by axis} }`.
- `defer` init to avoid blocking first paint.
- The host element carries the `max-height`/`max-width` (via `className`) that
  creates the overflow; OverlayScrollbars manages the rest.
- No hooks beyond the wrapper → can be dropped into server-rendered trees (it's a
  client component; children may be server-rendered and passed through).

### Theme — one global OverlayScrollbars theme

OverlayScrollbars v2 themes via CSS custom properties on a theme class. Define
`os-theme-chtivo` once in a global stylesheet (e.g. `src/styles/globals.scss` or a
dedicated `scrollbar.scss` imported in the root layout), using our tokens:

```scss
.os-theme-chtivo {
  --os-size: 10px;                 // hit area thickness
  --os-padding-perpendicular: 3px; // insets the visible track to a thin line
  --os-padding-axis: 4px;
  --os-track-bg: rgba(220, 220, 220, 0.10);          // faint thin track line
  --os-track-bg-hover: rgba(220, 220, 220, 0.14);
  --os-handle-bg: rgba(220, 220, 220, 0.35);          // grey thumb
  --os-handle-bg-hover: rgba(220, 220, 220, 0.55);
  --os-handle-bg-active: rgba(220, 220, 220, 0.65);
  --os-handle-border-radius: 999px;                   // fully rounded
  --os-handle-min-size: 24px;
}

// Native touch scroll: hide our bar on touch devices.
@media (hover: none) and (pointer: coarse) {
  .os-theme-chtivo .os-scrollbar { display: none; }
}
```

> Exact px/alpha above are a **proposal** — easy to tune against the mock once it's
> on screen.

---

## Target containers (initial; living list — see Tracker)

Opt-in, wrapped with `<Scroller>`:

**Storefront**
- Main-page search dropdown — book/author results list (the example given).
- Awards / long option lists surfaced in search.
- Header nav dropdown menus (Чтецам / Авторам) if/when they overflow.
- Fixed-height long-text boxes (e.g. truncated description/quote panels) — audit which exist.

**Admin**
- `AdminSelect` options popover (can grow long — e.g. authors/books/awards).
- Shared `Modal` body when content is tall.
- Any `overflow:auto` lists/panels (e.g. audit table horizontal scroll → horizontal bar).

Excluded: `<textarea>` (keeps native resize/scroll), the main window, and the
`AdminDatePicker` grids (fixed size, no scroll).

---

## Edge cases & risks

- **No double scrollbars** — wrap the element that currently has `overflow:auto`,
  and remove that raw overflow once `<Scroller>` owns it.
- **Portals/popovers** — OverlayScrollbars works inside portaled menus/modals.
- **Layout shift** — overlay scrollbars don't reserve layout width; `defer` init
  avoids first-paint jank.
- **SSR** — wrapper is `'use client'`; verify no hydration mismatch (host renders
  the same markup server/client).
- **Existing scrollbar CSS** — confirm there are no stray `::-webkit-scrollbar`
  rules to remove (grep first; the design-handoff prototype's are not in the app).
- **Keyboard / a11y** — native scrolling + focus preserved; don't trap focus.
- **Dependency hygiene** — pin `overlayscrollbars` + `overlayscrollbars-react`
  exact; commit the `package.json`/lockfile change.

---

## Build phases

1. **Foundation** — add pinned deps, import base CSS once, define `os-theme-chtivo`,
   build `<Scroller>` + module styles.
2. **Pilot** — apply to two high-value cases (admin `AdminSelect` menu + the
   storefront main-page search results), validate in Chrome **and** Firefox
   (+ Safari if available) and on a touch viewport.
3. **Roll-out** — wrap the remaining target containers from the list above;
   remove now-redundant raw `overflow` declarations.
4. **QA & polish** — cross-browser + touch + reduced-motion pass, tune theme px to
   match the mock, `lint`/`build` clean, screenshots.

---

## Acceptance (Definition of Done)

- A scrollable container shows the same thin track + rounded grey thumb in Chrome,
  Firefox, and Safari; nothing shown when content fits.
- Touch devices scroll natively with the bar hidden.
- Both axes themed; no double scrollbars, no layout shift, no hydration warnings.
- Deps pinned; `npm run build` + lint clean.

---

## Tracker

`⬜ not started · 🟡 in progress · ✅ done`

| # | Item | Status |
|---|------|--------|
| 1 | Add `overlayscrollbars` (`2.16.0`) + `overlayscrollbars-react` (`0.5.6`) (pinned); import base CSS once | ✅ |
| 2 | Define `os-theme-chtivo` theme (tokens) in a global stylesheet | ✅ |
| 3 | Build `src/components/common/Scroller/` (component + scss + index) — now with `forwardRef` for viewport access | ✅ |
| 4 | Refactor `HeaderSearchBar` from Radix `ScrollArea` → `<Scroller>` (remove Radix scrollbar styles) | ✅ |
| 5 | Pilot: wrap `AdminSelect` menu with `<Scroller>` | ✅ |
| 6 | Roll out to remaining target containers — `Modal` body wrapped with `<Scroller>` | ✅ |
| 7 | Cross-browser/touch/reduced-motion QA; tune theme px; lint+build | 🟡 |

**Container checklist (fill as discovered):**

- ✅ Storefront — main-page search results dropdown (`HeaderSearchBar` — refactored to `<Scroller>`)
- ⬜ Storefront — header nav dropdowns (if overflowing)
- ⬜ Storefront — fixed-height long-text panels (audit which)
- ✅ Admin — `AdminSelect` options popover (max-height 240px, vertical-only Scroller)
- ✅ Admin — shared `Modal` tall body (flex column + Scroller body)
- ✅ Storefront — box-set preview book row (horizontal, main page)
- ⬜ Admin — other `overflow:auto` lists / horizontal tables

### HeaderSearchBar refactor notes (2026-06-06)

`src/components/layout/HeaderSearchBar/HeaderSearchBar.tsx` currently uses
`@radix-ui/react-scroll-area` with hand-rolled `.scrollbar` / `.scrollThumb`
styles in `HeaderSearchBar.module.scss`. To complete the `<Scroller>` rollout:

1. Replace `ScrollArea.Root` / `ScrollArea.Viewport` / `ScrollArea.Scrollbar` /
   `ScrollArea.Thumb` with a single `<Scroller className={styles.scrollViewport}>`.
2. Move the `max-height` constraint from `.scrollViewport` to the Scroller's
   `className`.
3. Remove the Radix `ScrollArea` import and the `.scrollbar` / `.scrollThumb`
   SCSS classes (OverlayScrollbars + `os-theme-chtivo` own the visuals).
4. Verify infinite-scroll `IntersectionObserver` still works (it currently
   observes `scrollViewportRef` — Scroller's viewport element is accessible via
   the OverlayScrollbars instance or a `ref` callback).

Append scope changes here with a date.
