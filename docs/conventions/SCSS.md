# SCSS Conventions

## File Placement

- Component/page-specific styles: `ComponentName.module.scss` next to the component file
- Global token definitions: `src/styles/params.scss`
- Breakpoint mixin: `src/styles/breakpoints.scss`
- Reusable mixins (text types, layout, utilities): `src/styles/mixins.scss`
- Barrel (shared imports): `src/styles/common.scss`
- Global reset and base styles: `src/styles/globals.scss` (imported once in `app/layout.tsx`)

## Module vs Global

- Use CSS Modules (`*.module.scss`) for all component-level styling
- Global classes only for truly cross-cutting concerns: CSS reset, base typography, CSS custom properties
- Never introduce new global selectors for one-off component styling

## File Naming

- Module files: `kebab-case.module.scss` (e.g. `book-card.module.scss`)
- Global files: no `.module` suffix (e.g. `globals.scss`, `params.scss`)

## Class Names

- SCSS class names: `kebab-case` (e.g. `.book-card`, `.add-to-cart-btn`)
- Access in JS/TSX as camelCase via Next.js CSS Modules transform (e.g. `css.bookCard`, `css.addToCartBtn`)

## CSS Module Usage Pattern

```tsx
import cn from 'classnames'
import css from './BookCard.module.scss'

<div className={cn(css.wrapper, isActive && css.active, className)}>
  <span className={css.title}>{title}</span>
</div>
```

Always import `classnames` as `cn`.

## SCSS Syntax

- Use `@use` / `@forward` — never `@import` (deprecated in modern Sass)
- Import shared tokens in module files:
  ```scss
  @use '@/styles/common' as *;
  ```
- Keep nesting shallow — maximum 3 levels deep to avoid specificity creep

## Tokens and Variables

All design tokens live in `src/styles/params.scss`. Use them; do not hardcode values.

```scss
// good
color: $color-text-primary;
background: $color-surface;

// bad
color: #12101c;
background: #ffffff;
```

Prefer semantic token names over palette names where they exist.
When introducing a new token, add it to `params.scss` — never scatter literals.

## Mixins

Reusable mixins live in `src/styles/mixins.scss` and are available via `common.scss`.

```scss
@use '@/styles/common' as *;

.title {
  @include section-title;
}

.description {
  @include text-body;
  @include line-clamp(3);
}
```

Available mixins:

| Mixin | Purpose |
|-------|---------|
| `section-title` | Cheque display heading at 57px with full responsive scaling (⚠ `@font-face` for Cheque lives in `Slider.module.scss` — move to `globals.scss`) |
| `text-body` | Base body text (16px, Inter) |
| `text-body-lg` | Large body text (18px) |
| `text-body-sm` | Small body text (14px) |
| `text-heading` | Bold heading text |
| `text-muted` | Muted secondary text |
| `focus-ring` | Accessible focus outline |
| `hover-opacity($opacity)` | Opacity transition on hover |
| `page-container` | Centered 1400px max-width container with side padding |
| `aspect-ratio($w, $h)` | Aspect ratio helper |
| `line-clamp($lines)` | Multi-line ellipsis |
| `truncate` | Single-line ellipsis |
| `visually-hidden` | Screen-reader-only content |

When multiple components share the same typographic or layout pattern, extract it into a mixin rather than duplicating values.

## CSS Custom Properties

Theme-level values are defined as CSS custom properties on `:root` in `globals.scss`.
SCSS variables that reference them:

```scss
$color-text-primary: var(--color-text-primary);
$color-surface: var(--color-surface);
```

## Responsive Strategy: Desktop-First

Write base styles for desktop. Override with narrower breakpoints below.

```scss
@use '@/styles/common' as *;

.wrapper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);

  @include breakpoint('tablet') {   // max-width: 1200px
    grid-template-columns: repeat(2, 1fr);
  }

  @include breakpoint('phone') {    // max-width: 767px
    grid-template-columns: 1fr;
  }
}
```

Available breakpoints (defined in `src/styles/breakpoints.scss`):

| Name | Rule |
|------|------|
| `desktop` | `min-width: 1201px` |
| `tablet` | `max-width: 1200px` |
| `tablet-only` | `min-width: 768px` and `max-width: 1200px` |
| `phone` | `max-width: 767px` |

Keep responsive overrides adjacent to their base selector — do not collect all responsive rules at the bottom of the file.

## Specificity and Overrides

- Avoid `!important` unless required to override a third-party stylesheet
- Prefer class composition over deep descendant selectors
- Do not style by element selector alone inside component modules when a class is available:
  ```scss
  // bad
  .wrapper span { color: red; }

  // good
  .label { color: red; }
  ```
