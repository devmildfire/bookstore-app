# Blur Placeholders for Bucket Images

**Status**: Pending
**Branch**: update
**Tracker**: [blur-placeholders-tracker.md](./blur-placeholders-tracker.md)

---

## Goal

Add `placeholder="blur"` with a tiny base64 `blurDataURL` to every `<Image>`
that points at a Supabase Storage bucket, so users see a faint, dominant-color
LQIP instead of the dark-gradient fallback while the full image loads.

Buckets in scope (per user): `covers`, `authors`, `book-photos`,
`subscriptions`.

Out of scope (raise separately if wanted): box-set images (local
`public/boxsets/`), booktrailer posters, award images, SVG assets.

---

## Approach

Next.js auto-generates `blurDataURL` only for **static imports**. For remote
Supabase URLs we must supply it explicitly. Two viable strategies:

| Strategy | When | Cost |
|---|---|---|
| Precompute at upload/seed time, store in DB | Once per asset | One column write |
| Compute on every request server-side | On each render | Sharp work + network |

We picked **precompute**. `sharp@0.33.5` is already in `package.json` and used
by the upload scripts. Reusing it costs nothing extra.

A `blurDataURL` is ~700 B–1.5 KB of base64 text per image — negligible storage.

---

## Schema changes

| Table | Existing column | New column | Notes |
|---|---|---|---|
| `Titles` | `cover` | `cover_blur TEXT NULL` | Base64 data URL for the cover |
| `Authors` | `photo` | `photo_blur TEXT NULL` | Base64 data URL for the author photo |
| `Subscriptions` | `image` | `image_blur TEXT NULL` | Base64 data URL for the subscription image |
| `Titles` | (no per-photo row) | `book_photos_blurs JSONB NULL` | Map filename → data URL for the `book-photos/{slug}/*` set |

The `book_photos_blurs` column sits on `Titles` because `book-photos` are
keyed by slug and there is no per-photo row. `getBookPhotoUrls` already lists
the slug folder from Storage; it will be augmented to also read this JSONB
and merge by filename.

After migration, regenerate `src/types/supabase.ts` per CLAUDE.md.

---

## Shared helper

```ts
// scripts/_blur.mjs
import sharp from 'sharp'

export async function makeBlurDataUrl(buffer) {
  const out = await sharp(buffer)
    .resize(10, 15, { fit: 'inside' })
    .jpeg({ quality: 40 })
    .toBuffer()
  return `data:image/jpeg;base64,${out.toString('base64')}`
}
```

Used by every upload / back-fill script. Output dimensions follow the
2:3 cover aspect — for author / subscription / book-photo it's still fine
(Next.js scales the placeholder to fit the `<Image>` box).

---

## Script changes

1. **`scripts/upload-covers-to-supabase.mjs`** — when uploading each cover,
   compute the blur and emit an SQL `UPDATE Titles SET cover_blur = '…'
   WHERE cover = '<filename>'`. Plus a back-fill mode that reads every
   existing cover from the bucket and writes only `cover_blur`.

2. **`scripts/sync-author-photos.mjs`** — same pattern for `Authors.photo_blur`.

3. **New: `scripts/sync-book-photo-blurs.mjs`** — walks each
   `book-photos/{slug}/` folder, computes `{filename: blur}` for every photo,
   writes one `UPDATE Titles SET book_photos_blurs = '<jsonb>' WHERE slug = …`.

4. **New: `scripts/sync-subscription-blurs.mjs`** — same as covers, but
   iterates `subscriptions` bucket and writes `Subscriptions.image_blur`.

All scripts: idempotent — re-running over a fully-seeded DB is a no-op.

---

## Entity / API layer changes

| File | Change |
|---|---|
| `src/entities/book/server.ts` | Add `cover_blur`, `book_photos_blurs` to the `bookQuery` select. |
| `src/entities/book/client.ts` | Add `coverBlurDataUrl: string \| null` on `Book`; add `photoBlurDataUrl: string \| null` on the author shape. |
| `src/entities/book/normalize.ts` | Surface `coverBlurDataUrl` from `cover_blur`; surface author `photoBlurDataUrl` from joined `Authors.photo_blur`. |
| `src/entities/subscription/server.ts` | Add `image_blur` to select. |
| `src/entities/subscription/client.ts` | Add `imageBlurDataUrl: string \| null`. |
| `src/entities/subscription/normalize.ts` | Surface `imageBlurDataUrl`. |
| `src/api/books/getBookPhotos.ts` | Refactor to `Promise<{ url, blurDataURL }[]>`. Fetch `book_photos_blurs` for `slug` from `Titles` and merge by filename. Empty blur if missing. |

---

## Component changes (every `<Image>` that points at a bucket)

| File | Image | What to add |
|---|---|---|
| `src/components/book/BookCard/BookCard.tsx` | cover | `placeholder` + `blurDataURL={book.coverBlurDataUrl ?? undefined}` (only set `placeholder='blur'` when the URL exists) |
| `src/app/books/[slug]/BookCoverSlider.tsx` | cover + book photos | pass per-photo blur via the new shape from `getBookPhotoUrls` |
| `src/components/common/Slider/…` | featured book covers | same as BookCard |
| `src/app/books/[slug]/BookAuthor/BookAuthor.tsx` | author photo | `placeholder` + author's `photoBlurDataUrl` |
| `src/app/books/[slug]/BookAuthorsList/BookAuthorsList.tsx` | author photos | same |
| `src/components/subscriptions/…` | subscription image | `placeholder` + `imageBlurDataUrl` |

Helper for safety: a thin `BlurImage` wrapper is **not** introduced — direct
props on `next/image` are simpler and the conditional is one line.

```tsx
<Image
  src={url}
  alt={alt}
  placeholder={blurDataURL ? 'blur' : 'empty'}
  blurDataURL={blurDataURL ?? undefined}
  …
/>
```

When `blurDataURL` is null (legacy row, back-fill pending), `placeholder` falls
back to `'empty'` and the image renders as before — no breakage.

---

## Acceptance

- Every `<Image>` listed in the component table above passes
  `placeholder="blur"` whenever the row has a blur populated.
- A book detail page hit under Slow 3G shows a soft colored blur where the
  cover / author / book-photo would be, before the full JPEG arrives. No
  flash of dark void.
- `npm run lint` and `npx tsc --noEmit` are clean (the pre-existing
  `getBooks.ts` error is unrelated and can remain).
- Hitting a page where rows still have `*_blur = NULL` does not throw — the
  image just renders without a placeholder.

---

## Confirmation before implementation

1. Putting `book_photos_blurs` as a JSONB column on `Titles` (vs. a new
   `BookPhotos` table) is the lightweight choice. OK?
2. Subscriptions don't have an upload script currently. OK to add
   `scripts/sync-subscription-blurs.mjs` that uploads + writes blurs in one
   pass for whatever is in the `subscriptions` bucket?
3. After this lands, want me to circle back and also do box-set images,
   booktrailer posters, and award images, or leave those alone?
