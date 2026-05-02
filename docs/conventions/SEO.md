# SEO & Accessibility

## SEO — Metadata API

This project uses Next.js 16's built-in `Metadata` API. Do not use `next-seo` or
`next/head` for SEO tags — use `generateMetadata()` or the static `metadata` export.

### Static metadata (layout or simple page)

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Книжный магазин',
    template: '%s | Книжный магазин',
  },
  description: 'Онлайн магазин электронных книг',
}
```

### Dynamic metadata (data-driven page)

```tsx
// src/app/books/[id]/page.tsx
import type { Metadata } from 'next'
import { getBook } from '@/api/books/getBook'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const book = await getBook(params.id)
  return {
    title: book.title,
    description: book.description?.slice(0, 160),
    openGraph: {
      title: book.title,
      description: book.description?.slice(0, 160),
      images: book.coverUrl ? [{ url: book.coverUrl }] : [],
    },
  }
}
```

### Rules

- Every public-facing page must export `metadata` or `generateMetadata`
- Always set `title`, `description`, and `openGraph` fields
- `description` must be ≤ 160 characters
- `title` should use the template defined in root `layout.tsx`

## Accessibility

### Semantic HTML First

Use semantic HTML elements — they provide built-in accessibility meaning and require
no extra ARIA:

```tsx
// good
<nav>, <main>, <header>, <footer>, <section>, <article>, <aside>
<button>, <a href>, <input>, <label>, <form>
<h1> through <h6> in logical order

// bad — meaningless to screen readers
<div onClick={...}>
<span className={css.button}>
```

### ARIA — Only When Semantics Are Insufficient

Do not add ARIA attributes that duplicate what the element already expresses.
Add them only when semantic HTML cannot convey the intent:

```tsx
// wrong — <button> already has role="button"
<button role='button' aria-label='Click me'>

// correct — icon-only button has no visible label
<button aria-label='Закрыть корзину'>
  <CloseIcon aria-hidden='true' />
</button>
```

Common legitimate uses: `aria-label` on icon buttons, `aria-expanded` on toggles,
`aria-live` on notification regions, `aria-describedby` linking inputs to error messages.

### Keyboard Navigation

All interactive elements must be reachable and operable via keyboard:
- Buttons and links must be focusable and activatable with `Enter`/`Space`
- Modals must trap focus while open and restore focus on close (Radix Dialog handles this)
- Dropdowns must close on `Escape` (Radix handles this)
- Do not suppress the default focus outline — style it in SCSS instead of removing it

### Images

Every `<Image>` must have an `alt` attribute:
- Meaningful content: descriptive alt text in Russian (`alt='Обложка книги: {title}'`)
- Decorative images: `alt=''` (empty string — tells screen readers to skip it)
- Never use the filename or URL as alt text

### Colour Contrast

Aim for **WCAG 2.1 AA** minimum:
- Normal text (< 18px): contrast ratio ≥ 4.5:1
- Large text (≥ 18px bold or ≥ 24px): contrast ratio ≥ 3:1
- Use a contrast checker tool before finalising colour token values in `params.scss`

### Focus Visible

Do not remove the focus ring with `outline: none` without providing an alternative.
Use the CSS `:focus-visible` pseudo-class to show the ring only on keyboard navigation
(not on mouse clicks):

```scss
.button {
  outline: none;

  &:focus-visible {
    outline: 2px solid $color-brand-primary;
    outline-offset: 2px;
  }
}
```

## Security

- Never store API keys, JWTs, or session secrets in `localStorage` or Redux state —
  use HTTP-only cookies (Supabase SSR handles this)
- Never put secrets in `NEXT_PUBLIC_` env variables — those are exposed to the browser
- Avoid `dangerouslySetInnerHTML` unless the content is from a trusted source and
  has been sanitized server-side
- Validate and sanitize all user-provided input at form boundaries (Zod schemas) and
  before inserting into the database
