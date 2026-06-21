# Performance Conventions

> These are the **coding rules** (how to write a fast component). For the **strategy** behind our
> optimization — the decision framework, what PSI actually measures, the defer-behind-interaction
> lever, techniques + rationale, and rejected approaches — read the playbook:
> [`docs/perf/README.md`](../perf/README.md). Optimize per these rules; decide *what* to optimize per
> the playbook.

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

## Blur Placeholders for Bucket Images

Every `<Image>` that points at a Supabase Storage bucket (covers, authors,
book-photos, subscriptions) renders a tiny base64 LQIP while the full image
loads. Next.js auto-generates `blurDataURL` for static imports but not for
remote URLs, so the data URL is **precomputed and stored in the database**:

| Table | Column | Used for |
|---|---|---|
| `Titles` | `cover_blur TEXT` | `Titles.cover` |
| `Titles` | `book_photos_blurs JSONB` | Map of filename → data URL for files under `book-photos/{slug}/` |
| `Authors` | `photo_blur TEXT` | `Authors.photo` |
| `Subscriptions` | `image_blur TEXT` | `Subscriptions.image` |

The entity normalizers surface these as `coverBlurDataUrl`, author
`photoBlurDataUrl`, `imageBlurDataUrl`, and `getBookPhotos()` returns
`{ url, blurDataURL }[]`. Components never compute blur data — they read it
from the normalized entity.

Pattern at every `<Image>` callsite:

```tsx
<Image
  src={book.coverUrl}
  alt={`Обложка книги: ${book.title}`}
  placeholder={book.coverBlurDataUrl ? 'blur' : 'empty'}
  blurDataURL={book.coverBlurDataUrl ?? undefined}
  width={240}
  height={320}
/>
```

`placeholder={blur ? 'blur' : 'empty'}` keeps legacy rows (where the blur is
`NULL`) rendering as before — no breakage.

Adding new bucket images: upload the file, run the matching
`scripts/sync-*-blurs.mjs` to backfill the `*_blur` column, then expose the
field through the entity's `client.ts` / `normalize.ts` and pass it to
`<Image>` as above. See `AGENTS.md` § Storage & Images for the script list.

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
import { Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-montserrat',
})
```

## Streaming and Suspense

Use `loading.tsx` files and `<Suspense>` boundaries to stream page content incrementally.
Slow data (e.g. personalized recommendations) should be wrapped in Suspense so the
rest of the page renders immediately.

> **⚠ Do NOT add a `loading.tsx` to the `(site)` storefront route group, nor any segment
> that is a Suspense ancestor of the home page.** The home `page.tsx` `await`s server data,
> so a route-group `loading.tsx` makes its tiny fallback (a spinner) paint first, then the
> full hero+catalog page swaps in — a discrete layout shift. We measured CLS jump from a
> stable **0** to **0.27 (desktop) / 0.44 (mobile)**, with perf **97 → 73**, the day a
> well-meaning `(site)/loading.tsx` was added (audit fix CA1, 2026-06-21). It was reverted.
> Reserve space with an **in-page** skeleton inside the page (a `<Suspense>` whose fallback
> mirrors the real layout's dimensions — e.g. `CatalogSectionSkeleton`), not a route-level
> spinner. `loading.tsx` is only safe on a segment whose *whole* visible layout the fallback
> faithfully reserves (see `books/(catalog)/loading.tsx`, `books/[slug]/loading.tsx`).

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
