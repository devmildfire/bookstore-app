# Edition "Демо-версия" button

**Status**: Pending — only the placeholder UI is shipped; no backing assets, storage, or download flow exist yet.
**Branch**: update
**Last verified**: 2026-06-06 (audited against the codebase)

---

## Context

The book detail page's edition tab panels (`Book 2.0`, `AudioBook`, `EBook`) each
render a "Демо-версия" button next to "Добавить в корзину". The PrintBook tab
intentionally does not have this button — print editions don't have a demo.

Currently the button is rendered but **disabled** (`<button disabled>`). The
visual is final; only the demo content + click behavior remain.

Implementation lives in
`src/app/(site)/books/[slug]/BookEditionTabs/BookEditionTabs.tsx`
(`HAS_DEMO_BUTTON` map at line ~121 + the disabled button at line ~197).

---

## Current status (verified 2026-06-06)

Audited the codebase end-to-end. What actually exists vs. what the plan calls for:

| Piece                                   | State | Notes |
|-----------------------------------------|:-----:|-------|
| Placeholder disabled button (Book2.0 / AudioBook / EBook, PrintBook excluded) | ✅ Done | `BookEditionTabs.tsx` — `HAS_DEMO_BUTTON` + `styles.demoBtn`, still `disabled aria-label="Демо-версия (скоро)"` |
| Demo storage columns for this feature   | ❌ Not done | See legacy-column note below |
| `demos` storage bucket + policies       | ❌ Not done | No bucket, no migration mentions "demo" |
| Entity / `normalize.ts` demo field(s)   | ❌ Not done | `src/entities/*` has no demo field |
| Enabled button + download/preview flow  | ❌ Not done | Button is still hard-disabled |
| Admin upload slot for demo assets       | ❌ Not done | `FileSlot`/`ProductsManager` only handle the real `file_path` |
| Analytics event                         | ❌ Not done | — |

**Legacy-column note (important):** `Titles.demo TEXT` and `CardBooks.demo TEXT`
already exist — but they come from the original scrape schema (`supabase/seed.sql`
lines 38 and 81), are **not** wired to anything (no reads in `src/entities` or
`src/api`), and `Audiobooks` / `Ebooks` have **no** demo column at all. Do not
assume `CardBooks.demo` is this feature's storage; decide deliberately whether to
repurpose it or add fresh, consistently-named columns.

**Net:** effectively only the placeholder UI is done. The hard part — assets,
storage, and the download flow — is untouched.

---

## Decision (new): demos are downloadable

Per product direction (2026-06-06), the demo button must make the demo **available
to download** for audiobooks, digital (EBook), and card books (Book 2.0). This
resolves open question #2 below: **downloadable, not stream-only.** A simple
"download the sample file" flow is the baseline; an inline preview/player is
optional polish on top, not a blocker.

This means the demo flow can closely mirror the existing purchased-file download
(`src/api/orders/getDownloadUrl.ts`) — but **without** the ownership / paid-order
gate, since demos are public by definition.

---

## Reuse the existing digital-download infrastructure

The purchased-file path is a ready-made template:

- `src/api/orders/getDownloadUrl.ts` — verifies ownership, then issues a fresh
  **1 h signed URL** via the service-role client with `{ download: true }`
  (forces `Content-Disposition: attachment` so the browser saves rather than
  opening inline). Has a per-category **placeholder** fallback
  (`placeholders/{ebook.pdf,audiobook.mp3,book2.pdf}` in the private
  `digital-files` bucket) for editions whose real file isn't uploaded yet.
- Admin upload of the real edition file is the `FileSlot` flow in
  `ProductsManager` (`src/lib/admin/books/actions.ts`).

For demos, the simplest correct shape:

- A **public** `demos` bucket (no signing needed — demos aren't access-gated), OR
  reuse `digital-files` and just skip the ownership check when signing the demo
  object. Public bucket is cleaner (no service-role round-trip per click).
- A demo-specific upload slot in `ProductsManager`, mirroring `FileSlot`.
- A demo-specific download/preview helper that mirrors `getDownloadUrl` minus the
  ownership/paid gate.

---

## Intended demo content per edition

| Edition  | Demo content                                              |
|----------|-----------------------------------------------------------|
| Book 2.0 | A short text excerpt (same format as PrintBook) or a sample PDF page |
| AudioBook | An audio clip (10–30 s) of the narrator                 |
| EBook    | A short text excerpt (first chapter / first N characters) or sample PDF |

Print books are excluded.

---

## Storage shape (proposal — confirm before migration)

One nullable column per edition table pointing to its demo asset in the `demos`
bucket (bare object key, mirroring the `file_path` convention):

- `CardBooks.demo_path        text` (sample PDF/text for Book 2.0)
- `Audiobooks.demo_path       text` (mp3 clip)
- `Ebooks.demo_path           text` (sample PDF/text)

Naming chosen as `demo_path` (not `demo_url`) to match the existing `file_path`
bare-key convention and to avoid colliding with the legacy `CardBooks.demo TEXT`
column. If inline text excerpts are preferred over uploaded files, use
`demo_text text` instead — but that doesn't satisfy "available to download" for
audio, so files are the better default.

---

## UI behavior

- If the relevant `demo_path` column is null, the button stays **disabled** — same
  as today.
- If present, clicking the enabled button **downloads** the demo file (signed/
  public URL with `Content-Disposition: attachment`).
- Optional polish (non-blocking): a modal/lightbox text preview for EBook/Book2.0
  and an inline `<audio>` mini-player for AudioBook, with the download as the
  primary action.
- Tracking: emit `edition_demo_opened` with `{ edition_id, product_type }`.

---

## Open questions

1. Bucket vs inline text — does the editor prefer uploading files or typing the
   excerpt in the CMS? (Files are the default since audio can't be inline text.)
2. ~~Should the audio demo be downloadable, or strictly stream-only?~~
   **Resolved: downloadable** (2026-06-06 product direction).
3. Audio clip length cap (10 s / 30 s / 60 s)?
4. Public `demos` bucket vs. reusing private `digital-files` with an ungated
   signed URL?

---

## Tasks (when picked up)

1. [x] Placeholder disabled button on Book2.0/AudioBook/EBook tabs (PrintBook excluded).
2. [ ] Finalize storage shape (file vs inline; public vs private bucket) — open questions 1 & 4.
3. [ ] Migration: add `demo_path` columns to `CardBooks` / `Audiobooks` / `Ebooks`
   + create the `demos` bucket and policies. (Optionally drop the unused legacy
   `Titles.demo` / `CardBooks.demo` columns, or leave them be.)
4. [ ] Regenerate Supabase types and extend `BookServerRow` / `Book` / `normalize.ts`
   with the demo field(s).
5. [ ] Admin: add a demo upload slot to `ProductsManager` (mirror `FileSlot`).
6. [ ] Backend: demo download helper (mirror `getDownloadUrl.ts` minus the ownership/paid gate).
7. [ ] Wire `BookEditionTabs.tsx`: remove `disabled` when a demo asset is present;
   trigger download on click (+ optional `EditionDemoModal` preview/player).
8. [ ] Seed: add a demo asset for "Белый цветок" so the UI can be QA'd.
9. [ ] Analytics event hook-up (`edition_demo_opened`).
