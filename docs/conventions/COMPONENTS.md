# Component Conventions

## File Structure

Each component lives in its own folder with co-located styles and index re-export:

```
src/components/common/BookCard/
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
  src/components/common/BookCard/
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

## Layout Components

Pages that need a shell declare layout in `app/<route>/layout.tsx`.
Do not replicate layout markup per page — compose through layout files.

Current structure (flat — no route groups yet):

```
app/
  layout.tsx            ← root layout (fonts, providers, globals.scss, Header)
  page.tsx              ← homepage
  books/
  account/
  auth/
  cart/
  checkout/
```

Intended future structure using route groups (not yet implemented):

```
app/
  layout.tsx            ← root layout
  (shop)/
    layout.tsx          ← PageLayout (header + footer)
    books/
    cart/
  (protected)/
    layout.tsx          ← server-side auth guard + account shell
    account/
  (admin)/
    layout.tsx          ← admin auth guard + admin shell
    admin/
```
