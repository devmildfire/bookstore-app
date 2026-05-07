# Performance Conventions

## Core Web Vitals Targets

Every public-facing page should hit these thresholds:

| Metric | Target | What it measures |
|--------|--------|-----------------|
| **LCP** (Largest Contentful Paint) | < 2.5 s | Time until the largest content element renders |
| **INP** (Interaction to Next Paint) | < 200 ms | Time for the page to respond to user input |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Visual stability — elements must not shift after render |

## Measure Before Optimizing

Do not add `useMemo`, `useCallback`, or `React.memo` without profiling first.
Premature memoization adds complexity and indirection with no measurable benefit.

Workflow:
1. Identify a real problem with React Profiler or browser DevTools Performance tab
2. Pinpoint the specific bottleneck
3. Apply the optimization, then verify the improvement is measurable

## Server Components First

In App Router, the best performance optimization is using Server Components by default.
Server Components have zero JavaScript bundle cost — they render on the server and send
only HTML to the client. Reach for Client Components only when browser APIs or
interactivity are required.

## Dynamic Imports for Heavy Client Components

Use `next/dynamic` to defer loading heavy Client Components that are not needed on
the initial render:

```tsx
import dynamic from 'next/dynamic'

// Component that uses browser APIs or is rarely seen on first load
const BookCarousel = dynamic(() => import('@/components/books/BookCarousel'), {
  loading: () => <div className={css.carouselSkeleton} />,
})

// Component that should never SSR (accesses window/document directly)
const PaymentWidget = dynamic(() => import('@/components/checkout/PaymentWidget'), {
  ssr: false,
})
```

Apply dynamic imports to: carousels, image croppers, heavy charts, any component that
directly accesses `window` or `document`.

## Image Optimization

Always use `next/image` instead of `<img>`. It provides automatic format conversion
(WebP/AVIF), lazy loading, and correct sizing.

```tsx
import Image from 'next/image'

<Image
  src={book.coverUrl}
  alt={book.name}
  width={240}
  height={320}
/>
```

Rules:
- Always set explicit `width` and `height` (or `fill`) — this prevents CLS
- Use `priority` on the LCP image (the first book cover visible above the fold)
- Decorative images: `alt=""`

Remote image domains must be added to `next.config.ts` `images.remotePatterns`.
For book cover storage rules, including how `Titles.cover` maps to Supabase
Storage URLs, see `docs/conventions/DATA.md`.

## Preventing Layout Shift (CLS)

- Reserve space for images before they load (handled by `next/image` with explicit dimensions)
- Reserve space for async-loaded content with skeleton components
- Avoid injecting content above existing content after page load
- Set explicit `min-height` on containers that receive dynamic content

## Font Loading

- Use `next/font` to self-host fonts — eliminates external network requests and prevents
  layout shift from font swapping
- Apply `display: swap` via `next/font` options to prevent invisible text during load

```tsx
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
})
```

## Streaming and Suspense

Use `loading.tsx` files and `<Suspense>` boundaries to stream page content incrementally.
Slow data (e.g. personalized recommendations) should be wrapped in Suspense so the
rest of the page renders immediately.

```tsx
// app/books/page.tsx
import { Suspense } from 'react'
import BookGrid from '@/components/books/BookGrid'
import BookGridSkeleton from '@/components/books/BookGridSkeleton'

export default function BooksPage() {
  return (
    <main>
      <Suspense fallback={<BookGridSkeleton />}>
        <BookGrid />
      </Suspense>
    </main>
  )
}
```
