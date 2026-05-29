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

### `staleTime`

The global default is `staleTime: 60_000` (1 minute), set in `src/app/providers.tsx`. This prevents unnecessary refetches on every route change for data that rarely changes.

Override per-query when the data has a different freshness requirement:

```ts
useQuery({
  queryKey: bookQueryKey(id),
  queryFn: () => getBook(id),
  staleTime: 5 * 60 * 1000, // book detail is stable for 5 minutes
})
```

### Infinite / paginated queries

Use `useInfiniteQuery` for paginated lists that load more on scroll. Pass the offset as `pageParam`:

```ts
useInfiniteQuery({
  queryKey: searchBooksQueryKey(query),
  queryFn: ({ pageParam }) => searchBooks(query, pageParam as number, PAGE_SIZE),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages, lastPageParam) => {
    const fetched = allPages.reduce((sum, p) => sum + p.books.length, 0)
    if (fetched >= lastPage.total) return undefined
    return lastPageParam + PAGE_SIZE
  },
  enabled: query.length >= 3,
})
```

Flatten pages for rendering: `data?.pages.flatMap((p) => p.books) ?? []`.

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

## Book Cover Storage

Book cover images are stored in the public Supabase Storage bucket named `covers`.
The database stores only the storage object filename, not a URL or path.

```txt
Titles.cover = 'sin-greha.jpg'
```

Do not store any of these in `Titles.cover`:

```txt
http://localhost:54321/storage/v1/object/public/covers/sin-greha.jpg
/storage/v1/object/public/covers/sin-greha.jpg
/covers/sin-greha.jpg
book-title-sin-greha.jpg
01.png
```

The app turns the filename into a public URL in one place:

```ts
// src/lib/storage.ts
getCoverUrl('sin-greha.jpg')
// => `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/covers/sin-greha.jpg`
```

All book API paths must normalize rows through `normalizeBook()`, which calls
`getCoverUrl(raw.title_cover)`. Components should receive `book.coverUrl`; they
should not construct Supabase Storage URLs themselves.

When adding or changing covers:
- Upload the image object to the `covers` bucket.
- Store the exact object filename in `Titles.cover`.
- Keep `scripts/cover-mapping.json` in sync if the image came from scraped data.
- Regenerate `supabase/seed-books.sql` with `node scripts/generate-seed-sql.mjs`.
- If fixing an existing database, add a migration that updates `Titles.cover` to
  the bare filenames.

To verify local storage consistency:

```sql
select count(*) as missing_cover_objects
from public."Titles" t
left join storage.objects o on o.bucket_id = 'covers' and o.name = t.cover
where t.cover is not null and o.id is null;
```

The expected count is `0`. A Supabase Storage `Object not found` response from
`next/image` usually means `Titles.cover` does not exactly match an object name
in the `covers` bucket.

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

## Gift Cards and Promo Totals

Gift-card cart rows use the existing `Cart.category = 'GiftCard'` enum value.
They count toward the amount owed, but never toward promo-code discount bases.

Pricing code must apply this invariant in both places:
- client totals (`src/lib/cartTotals.ts`)
- server checkout totals (`place_order` RPC)

Wallet gift cards can pay only for the non-gift-card portion of the cart. A
buyer cannot use a gift-card balance to buy new gift cards.

## Client State

Most state is server state managed by TanStack Query.
For UI-only state, use in this order:

1. **Local `useState`** — if state is only needed in one component
2. **URL search params** — for filters, sorting, pagination (bookmarkable, shareable)
3. **React Context** — for state shared across a subtree (cart count in header, auth user)

There is no global client-state library (no Zustand, no Redux, no MobX). Most state fits the first three options.
