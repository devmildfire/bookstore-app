# Error Handling Conventions

## General Rules

- Never swallow errors silently — always propagate, log, or surface them
- Remove all `console.log` debug statements before committing
- Keep API keys and secrets server-side only — never expose them in client error payloads

## Server Components and Server Actions

Throw errors freely — Next.js catches them and renders the nearest `error.tsx` boundary:

```tsx
// src/api/books/getBook.ts
export async function getBook(id: string): Promise<Book> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('books').select('*').eq('id', id).single()
  if (error) throw new Error(`Failed to fetch book ${id}: ${error.message}`)
  return normalizeBook(data)
}
```

For Server Actions that are called from forms, return a typed error object instead of
throwing — throwing in a Server Action surfaces an uncaught error to the client:

```ts
// src/lib/auth/actions.ts
'use server'

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { error } = await supabase.auth.signInWithPassword({ ... })
  if (error) return { status: 'error', message: error.message }
  redirect('/account')
}

type ActionState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success' }
```

## Error Boundaries (`error.tsx`)

Every route segment that performs async data fetching should have a co-located
`error.tsx` to handle fetch failures gracefully:

```tsx
// src/app/books/error.tsx
'use client'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BooksError({ error, reset }: Props) {
  return (
    <div>
      <p>Не удалось загрузить каталог книг.</p>
      <button onClick={reset}>Попробовать снова</button>
    </div>
  )
}
```

Place `error.tsx` files at the route level — they must be Client Components (`'use client'`).

## Client-Side Error Boundary

Wrap the application root with a React Error Boundary to catch unexpected client-side
render errors. This prevents a single component crash from taking down the whole page.

```tsx
// src/components/common/ErrorBoundary/ErrorBoundary.tsx
'use client'

import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    // Log to server-side error reporting (Phase 11+)
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Что-то пошло не так.</p>
    }
    return this.props.children
  }
}
```

Key rules for the ErrorBoundary:
- Suppress browser extension errors (errors whose stack references `chrome-extension://`,
  `moz-extension://`, etc.) — these are not application errors
- Add a per-session send cap (e.g. 10 reports) to prevent error loops from flooding
  a future error reporting service
- Never expose raw error messages or stack traces to the user UI — log them server-side

## TanStack Query Errors

Handle query errors with the `error` state returned by `useQuery`:

```tsx
const { data, error, isError } = useQuery({ queryKey: ['cart'], queryFn: getCart })

if (isError) return <CartError message={error.message} />
```

For mutations, use `onError` in `useMutation`:

```tsx
const { mutate } = useMutation({
  mutationFn: addToCart,
  onError: (error) => {
    toast.error(`Ошибка добавления в корзину: ${error.message}`)
  },
})
```

## Not Found

Use Next.js `notFound()` for missing resources — it renders the nearest `not-found.tsx`:

```tsx
import { notFound } from 'next/navigation'

const book = await getBook(id)
if (!book) notFound()
```

Create `src/app/not-found.tsx` with a user-friendly Russian-language message.

## Loading States

Every route that fetches data should have a `loading.tsx` to show a skeleton during
streaming. This prevents blank pages:

```tsx
// src/app/books/loading.tsx
import BookGridSkeleton from '@/components/books/BookGridSkeleton'

export default function BooksLoading() {
  return <BookGridSkeleton />
}
```
