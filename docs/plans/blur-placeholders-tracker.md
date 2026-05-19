# Blur Placeholders — Progress Tracker

**Plan**: [blur-placeholders.md](./blur-placeholders.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Add blocker
notes in the Notes section at the bottom.

---

## Steps

- [x] **1. DB migration: add the 4 new columns**
  Create `supabase/migrations/<ts>_add_image_blurs.sql`:
  - `ALTER TABLE "Titles" ADD COLUMN cover_blur TEXT NULL, ADD COLUMN book_photos_blurs JSONB NULL;`
  - `ALTER TABLE "Authors" ADD COLUMN photo_blur TEXT NULL;`
  - `ALTER TABLE "Subscriptions" ADD COLUMN image_blur TEXT NULL;`
  Run against local Docker DB to apply.
  Accept: columns visible via `\d "Titles"`, `\d "Authors"`, `\d "Subscriptions"`.

- [x] **2. Regenerate `src/types/supabase.ts`**
  Run the local generator command from CLAUDE.md.
  Accept: new fields visible in the generated types; `npm run lint` clean.

- [x] **3. Shared helper `scripts/_blur.mjs`**
  `makeBlurDataUrl(buffer)` → resize 10×15, JPEG q40, base64 data URL.
  Accept: a quick local test on one cover returns a `data:image/jpeg;base64,…`
  string ≲ 1.5 KB.

- [x] **4. `scripts/sync-cover-blurs.mjs` (new, back-fill)**
  Read every `Titles` row where `cover IS NOT NULL`, fetch the file from the
  `covers` bucket, compute the blur, UPDATE `cover_blur`. The original
  `upload-covers-to-supabase.mjs` reads from a local `public/covers/` dir
  that no longer exists, so a separate back-fill script is cleaner.
  Accept: `SELECT count(*) FROM "Titles" WHERE cover IS NOT NULL AND
  cover_blur IS NULL` → 0.

- [x] **5. `scripts/sync-author-photo-blurs.mjs` (new, back-fill)**
  Same pattern as #4 but for the `authors` bucket and `Authors.photo_blur`.
  Accept: `SELECT count(*) FROM "Authors" WHERE photo IS NOT NULL AND
  photo_blur IS NULL` → 0.

- [x] **6. New `scripts/sync-book-photo-blurs.mjs`**
  For each slug folder in the `book-photos` bucket: list files, compute
  blurs, UPDATE `Titles SET book_photos_blurs = '<jsonb>' WHERE slug =
  '<slug>'`.
  Accept: for any book whose `book-photos/{slug}/` has N files, the row's
  `book_photos_blurs` JSONB has N keys, one per filename, each with a data
  URL value.

- [x] **7. New `scripts/sync-subscription-blurs.mjs`**
  For each row in `Subscriptions` with `image IS NOT NULL`, fetch the
  blob, compute the blur, UPDATE `image_blur`.
  Accept: `SELECT count(*) FROM "Subscriptions" WHERE image IS NOT NULL AND
  image_blur IS NULL` → 0.

- [x] **8. Entity layer — Book**
  - `server.ts`: add `cover_blur`, `book_photos_blurs` to select; join
    `Authors.photo_blur` where authors are joined.
  - `client.ts`: add `coverBlurDataUrl`, author `photoBlurDataUrl`.
  - `normalize.ts`: surface both.
  Accept: TS compiles; a `Book` returned from `getBook(slug)` has the new
  fields populated when the DB has them.

- [x] **9. Entity layer — Subscription**
  Same as #8 for `image_blur` → `imageBlurDataUrl`.

- [x] **10. Refactor `src/api/books/getBookPhotos.ts`**
  Change return type to `Promise<{ url: string; blurDataURL: string | null
  }[]>`. Fetch `book_photos_blurs` for the slug from `Titles` and merge by
  filename when building the URLs.
  Accept: existing callers updated; type-check passes.

- [x] **11. Wire `<Image placeholder blurDataURL>` in every consumer**
  Files (see plan §Component changes):
  - `src/components/book/BookCard/BookCard.tsx`
  - `src/app/books/[slug]/BookCoverSlider.tsx`
  - `src/components/common/Slider/…` (home page featured covers)
  - `src/app/books/[slug]/BookAuthor/BookAuthor.tsx`
  - `src/app/books/[slug]/BookAuthorsList/BookAuthorsList.tsx`
  - `src/components/subscriptions/…` (subscription image)
  Always set `placeholder={blur ? 'blur' : 'empty'}` so legacy rows render
  unchanged.
  Accept: every listed `<Image>` passes the new props; no callsite missed
  (grep verifies).

- [x] **12. Visual verification on dev server**
  Under Slow 3G + 4× CPU throttle, hit:
  - `/` (home slider + box-sets section)
  - `/books` (catalog grid)
  - `/books/<slug>` (cover + book-photos carousel + author block)
  - `/subscription` (subscription images)
  Expect a soft coloured blur where the full image will appear, in place of
  the dark void.
  Accept: blur visibly precedes the JPEG on every image listed in §11.

- [x] **13. Lint, commit, push**
  `npm run lint`. Check the diff for secrets / large files. One commit per
  logical chunk if it makes the diff easier; otherwise a single
  `add blur placeholders for bucket images`. Push immediately per project
  memory.

---

## Notes / blockers

_(append entries as you work — date, what happened, what's needed to unblock)_
