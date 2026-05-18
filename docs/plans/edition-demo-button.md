# Edition "Демо-версия" button

**Status**: Pending — placeholder UI shipped, backing assets + flow TBD.
**Branch**: update

---

## Context

The book detail page's edition tab panels (`Book 2.0`, `AudioBook`, `EBook`) each
render a "Демо-версия" button next to "Добавить в корзину". The PrintBook tab
intentionally does not have this button — print editions don't have a demo.

Currently the button is rendered but **disabled** (`<button disabled>`). The
visual is final; only the demo content + click behavior remain.

Implementation lives in
`src/app/books/[slug]/BookEditionTabs/BookEditionTabs.tsx`
(`HAS_DEMO_BUTTON` map + the button itself).

---

## Intended behavior

Per edition type, the demo button should expose a short preview of the
edition's content:

| Edition  | Demo content                                              |
|----------|-----------------------------------------------------------|
| Book 2.0 | A short text excerpt (same format as PrintBook) or a PDF page |
| AudioBook | An audio clip (10–30 s) of the narrator                 |
| EBook    | A short text excerpt (first chapter / first N characters) |

Print books are excluded.

---

## Storage shape (proposal — confirm before migration)

Each edition table gets one nullable column pointing to its demo asset:

- `CardBooks.demo_url        text` (text excerpt or PDF in `demos` bucket)
- `Audiobooks.demo_audio_url text` (mp3 in `demos` bucket)
- `Ebooks.demo_url           text` (text excerpt or epub/pdf in `demos` bucket)

A separate Supabase Storage bucket `demos` (public, ~10 MB) hosts the files.

If text excerpts are stored inline rather than as files, add `demo_text text`
instead of `demo_url`.

---

## UI behavior

- If the relevant `demo_*` column is null, the button stays disabled — same as today.
- If present:
  - **Text demos** open a modal/lightbox with the excerpt and a close button.
  - **Audio demos** open an inline mini-player (play/pause + progress) or a
    modal player. Use a single `<audio>` element; no need for a heavy library.
- Tracking: emit a simple analytics event on click — `edition_demo_opened`
  with `{ edition_id, product_type }`.

---

## Open questions

1. Bucket vs inline text — does the editor prefer uploading files or typing
   the excerpt in the CMS?
2. Should the audio demo be downloadable, or strictly stream-only?
3. Audio clip length cap (10 s / 30 s / 60 s)?

---

## Tasks (when picked up)

1. Decide storage shape (file vs inline) — answer the open questions.
2. Migration: add `demo_*` columns + (if needed) create `demos` storage bucket
   + policies.
3. Regenerate Supabase types and extend `BookServerRow` / `Book` /
   `normalize.ts` with the demo field(s).
4. Wire `BookEditionTabs.tsx`:
   - Remove `disabled` when a demo asset is present.
   - Add a modal/player component (`EditionDemoModal`).
5. Seed: add a demo asset for "Белый цветок" so the UI can be QA'd.
6. Analytics event hook-up.
