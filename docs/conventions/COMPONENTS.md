# Component Conventions

## One component set — no one-offs, no admin/site duplication (READ FIRST)

**There is ONE set of UI components for the entire app — storefront *and* admin.**
A given UI element (input, textarea, select, button, badge, pager, date picker,
modal, …) has exactly **one** implementation, and it lives in
`src/components/common/`. Admin and storefront import the same component.

This is a hard rule:

- **Never create a one-off.** Do not write a bespoke `<input className={styles.input}>`,
  a local `MySelect`, a per-page button, or a second copy of an existing
  primitive. If a shared component exists, use it.
- **Never fork "admin" vs "site" versions.** We are actively collapsing the old
  `Admin*` duplicates (`AdminInput`/`AdminTextarea` are already merged into
  `common/Input`/`common/Textarea`; the rest are tracked in
  [docs/plans/ui-component-unification.md](../plans/ui-component-unification.md)).
  Do not add new ones.
- **Need a visual or behavioural difference? Add it with a prop**, not a new
  component — a `variant`, `size`, `tone`, boolean flag, or an optional
  slot/render prop on the existing component. Extend the one component so every
  caller benefits and nothing drifts.
- **Genuinely new primitive?** Add it once under `src/components/common/`, then
  reuse it everywhere. Co-locate styles; theme via the design tokens in
  `src/styles/params.scss` (the app is one dark design system).

Why: divergent inputs/buttons/etc. across screens read as broken and rot fast.
One component = one place to fix bugs, restyle, and keep accessibility correct.

## File Structure

Each component lives in its own folder with co-located styles and index re-export:

```
src/components/book/BookCard/
  BookCard.tsx
  BookCard.module.scss
  index.ts            ← re-exports BookCard as default
```

The `index.ts` is a thin re-export only — no logic:

```ts
export { default } from './BookCard'
```

## Component Size

- If a component exceeds ~200 lines of JSX + logic, split it into smaller focused sub-components
- Sub-components that are only used by one parent live in the parent's folder:
  ```
  src/components/book/BookCard/
    BookCard.tsx
    BookCard.module.scss
    BookCardBadge.tsx       ← only used inside BookCard
    index.ts
  ```

## Props

- Type props explicitly in the same file as the component
- No implicit `{}` or untyped props
- No spreading `{...props}` onto DOM elements — whitelist forwarded props
- Use a single `variant` prop over multiple boolean flags:
  ```tsx
  <Button variant="primary" size="lg" />   // good
  <Button isPrimary isLarge />              // bad
  ```
- Accept `className` as an optional prop on all presentational components to allow composition

## Radix UI Primitives

This project uses Radix UI for interactive components (dialogs, selects, popovers, etc.).
Radix provides behavior and accessibility; SCSS modules provide all visual styling.

Pattern for wrapping a Radix primitive:

```tsx
'use client'

import * as Dialog from '@radix-ui/react-dialog'
import cn from 'classnames'
import css from './Modal.module.scss'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export default function Modal({ open, onOpenChange, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={css.overlay} />
        <Dialog.Content className={cn(css.content, className)}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

- Never pass Tailwind classes to Radix components — styling is SCSS modules only
- Always include the `aria-label` or `aria-labelledby` that Radix expects for dialog/popover components

## Server Components

Server Components are the default. They fetch data directly and render synchronously.

```tsx
// app/books/page.tsx — Server Component (no 'use client')
import { getBooks } from '@/api/books/getBooks'
import BookGrid from '@/components/books/BookGrid'

export default async function BooksPage() {
  const books = await getBooks()
  return <BookGrid books={books} />
}
```

Rules:
- No hooks, no event handlers, no browser APIs
- Fetch Supabase data directly — no TanStack Query
- Pass data down to Client Component children as props

## Client Components

Add `'use client'` only at the lowest boundary that requires it.

```tsx
'use client'

import { useState } from 'react'
import { useAddToCart } from '@/hooks/useAddToCart'

type AddToCartButtonProps = {
  bookId: string
  price: number
}

export default function AddToCartButton({ bookId, price }: AddToCartButtonProps) {
  const { mutate, isPending } = useAddToCart()
  return (
    <button onClick={() => mutate({ bookId, price })} disabled={isPending}>
      {isPending ? 'Добавляется...' : 'В корзину'}
    </button>
  )
}
```

## Forms

All forms use React Hook Form + Zod.

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

type FormValues = z.infer<typeof schema>

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => { /* call server action */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Войти</button>
    </form>
  )
}
```

- Zod schemas live in `src/entities/<domain>/validation.ts`
- `z.infer<typeof schema>` derives the TypeScript type — do not duplicate it manually

## Shared UI Primitives

### `<Scroller>` — Custom Scrollbar Container

Wraps OverlayScrollbars v2. Use it instead of raw `overflow: auto/scroll`.

```tsx
import Scroller from '@/components/common/Scroller'

<Scroller style={{ maxHeight: 400 }}>
  {longContent}
</Scroller>
```

- Applies the `os-theme-chtivo` theme (thin grey thumb, hidden on touch).
- Accepts all standard `<div>` props plus `OverlayScrollbarsComponentProps`.
- Supports `ref` for viewport access via `useImperativeHandle`.
- Used in: `Modal`, `AdminSelect` dropdown, `HeaderSearchBar` results.

### Other shared primitives

| Component | Location | Purpose |
|-----------|----------|---------|
| `Modal` | `components/common/Modal/` | Radix Dialog wrapper with Scroller for content |
| `Skeleton` | `components/common/Skeleton/` | Loading placeholder (`text`, `rect`, `circle` variants) |
| `ErrorBoundary` | `components/common/ErrorBoundary/` | Class-based React error boundary at app root |

## Layout Components

Pages that need a shell declare layout in `app/<route>/layout.tsx`.
Do not replicate layout markup per page — compose through layout files.

Current structure:

```
app/
  layout.tsx               ← root layout (fonts, providers, globals.scss)
  (site)/                  ← storefront route group
    layout.tsx             ← Header + Footer chrome
    page.tsx               ← homepage
    auth/                  ← login/ register/ forgot-password/ reset-password/ confirm/
    profile/               ← user cabinet (multi-route layout)
    books/
      (catalog)/           ← catalog listing (page/loading/error)
      [slug]/              ← book detail (own loading.tsx)
    cart/
    checkout/
    payments/mock/         ← in-app mock payment gateway
    dino-magazine/, gift-cards/, subscription/, authors/, abzac/, about/ …
  admin/                   ← admin panel (no header/footer)
    login/                 ← admin email+password login
    (panel)/               ← guarded route group
      layout.tsx           ← AdminShell (AdminSideNav + content area)
      orders/, books/, authors/, box-sets/, gift-cards/,
      subscriptions/, promo-codes/, articles/, periodicals/,
      awards/, featured/, partners/, team/, submissions/,
      subscribers/, audit/ + dashboard   (dino-magazine/ → redirect to articles/)
```

The `(catalog)/` route group exists to scope its `loading.tsx` away from
`[slug]`. See `docs/conventions/ERROR_HANDLING.md` § Suspense scope and route
groups before adding sibling `loading.tsx` files under a shared parent.

The `admin/` panel uses its own chrome (`AdminShell` + `AdminSideNav`) with
email+password auth only (no OAuth, no anonymous). See the **Admin panel**
section in `AGENTS.md`.

## Admin Components

Admin UI lives in `src/components/admin/`. Key shared primitives:

| Component | Purpose |
|-----------|---------|
| `AdminShell` | Layout shell (sidebar + content) |
| `AdminSideNav` | Sidebar navigation |
| `AdminPageHeader` | Page title + actions bar |
| `AdminList` | Paginated list with sort/filter |
| `AdminFilterBar` | Filter controls row |
| `AdminPager` | Pagination controls |
| `AdminSelect` | Dropdown select with Scroller |
| `AdminDatePicker` | Date input |

Domain-specific admin forms (books, authors, articles, box sets, etc.) live in
subdirectories under `src/components/admin/`.

> **Note:** the text fields are no longer admin-specific. `AdminInput` /
> `AdminTextarea` were promoted to **`common/Input`** / **`common/Textarea`** and
> deleted from `admin/` (see the principle below). The remaining `Admin*`
> primitives above are next in line for the same treatment — see
> [docs/plans/ui-component-unification.md](../plans/ui-component-unification.md).
