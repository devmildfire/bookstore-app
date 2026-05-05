# Data Fetching Conventions

## Rule of Thumb

| Context | Use |
|---------|-----|
| Server Component (RSC) | Direct Supabase call — no TanStack Query |
| Client Component — read | TanStack Query `useQuery` |
| Client Component — write | TanStack Query `useMutation` |
| Form submission | Server Action (called from React Hook Form's `handleSubmit`) |
| Auth operations | Server Action via `src/lib/auth/actions.ts` |

## Server Components

Fetch directly using the server Supabase client. Do not wrap in TanStack Query.

```tsx
// app/books/page.tsx
import { createClient } from '@/lib/supabase/server'
import { normalizeBook } from '@/entities/book/normalize'

export default async function BooksPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('books').select('*')
  if (error) throw error
  const books = data.map(normalizeBook)
  return <BookGrid books={books} />
}
```

## TanStack Query — Client Components

### Setup

`QueryClientProvider` is mounted once in `src/app/layout.tsx` via a `'use client'` provider wrapper.

### Queries

```tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { getCart } from '@/api/cart/getCart'

export function useCart(cartId: string) {
  return useQuery({
    queryKey: ['cart', cartId],
    queryFn: () => getCart(cartId),
  })
}
```

- Query keys are arrays — include all parameters the query depends on
- Keep query functions in `src/api/<domain>/` — not inline in the hook

### Mutations

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart } from '@/api/cart/addToCart'

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addToCart,
    onSuccess: (_, { cartId }) => {
      queryClient.invalidateQueries({ queryKey: ['cart', cartId] })
    },
  })
}
```

- Always invalidate or update related queries on success
- Use optimistic updates for cart operations (add, remove, quantity change) to keep the UI instant

### Query Key Convention

Define query keys as constants next to the API function:

```ts
// src/api/books/getBook.ts
export const bookQueryKey = (id: string) => ['book', id] as const
export const booksQueryKey = (filters?: BooksFilters) => ['books', filters ?? {}] as const
```

## Supabase API Functions

All Supabase calls go through `src/api/<domain>/` functions — never call Supabase directly from components.

```ts
// src/api/books/getBook.ts
import { createClient } from '@/lib/supabase/client'
import { normalizeBook } from '@/entities/book/normalize'
import type { Book } from '@/entities/book/client'

export async function getBook(id: string): Promise<Book> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeBook(data)
}
```

- Use the browser client in client-side API functions
- Use the server client in Server Components and Server Actions
- Always propagate errors — never swallow them with an empty `catch`

## Entity Layer

Each domain entity in `src/entities/<name>/` has:

| File | Purpose |
|------|---------|
| `server.ts` | Supabase query definitions; infer server types with `QueryData<typeof query>` |
| `client.ts` | Normalized TypeScript interface used throughout the frontend |
| `normalize.ts` | Transform server shape → client shape |
| `validation.ts` | Zod schemas for form input and runtime validation |

```ts
// src/entities/book/server.ts
import { createClient } from '@/lib/supabase/client'
import type { QueryData } from '@supabase/supabase-js'

const supabase = createClient()
export const bookQuery = supabase.from('books').select('*, authors(*)')
export type BookServerRow = QueryData<typeof bookQuery>[number]
```

```ts
// src/entities/book/client.ts
export type Book = {
  id: string
  title: string
  authorName: string
  price: number
  coverUrl: string | null
  genres: string[]
}
```

```ts
// src/entities/book/normalize.ts
import type { BookServerRow } from './server'
import type { Book } from './client'

export function normalizeBook(raw: BookServerRow): Book {
  return {
    id: raw.id,
    title: raw.title,
    authorName: raw.authors?.name ?? 'Неизвестный автор',
    price: raw.price,
    coverUrl: raw.cover_url,
    genres: raw.genres ?? [],
  }
}
```

## Server Actions

Server Actions handle mutations that require server-side trust (auth, orders, payments).

```ts
// src/lib/auth/actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  redirect('/account')
}
```

- Server Actions are async functions in files marked `'use server'`
- Return `{ error: string }` on failure — do not throw to the client
- Call them from React Hook Form's `handleSubmit` or directly from `<form action={...}>`

## Client State

Most state is server state managed by TanStack Query.
For UI-only state, use in this order:

1. **Local `useState`** — if state is only needed in one component
2. **URL search params** — for filters, sorting, pagination (bookmarkable, shareable)
3. **React Context** — for state shared across a subtree (cart count in header, auth user)
4. **Zustand** — only if Context causes performance issues with frequent updates

Do not reach for Zustand by default — most state fits the first three options.
