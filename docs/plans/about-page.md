# About page (`/about`)

**Status**: Implemented on branch `update` (2026-05-23). Replaces the `ComingSoon` stub at `src/app/about/page.tsx`.
**Branch**: `update`
**Figma**: 1920 `1306-8039` · 1024 `2437-9544` · tablet `3704-8118` · mobile `2437-9545`
  (file key `CZwt15WEQ3Qugfy2NM1CPy`)

---

## Goal

Turn the existing stub into the full "О Чтиве" landing: hero video, manifesto
block, edition-type showcase, literary-journal teaser, team strip, partners
strip, donate form, email-signup form. All four Figma breakpoints
(1920 / 1024 / 744 / 320) covered using the project's existing breakpoints
(desktop / tablet / tablet-small / phone).

The page is read-only except for two stub forms (donate, signup) that validate
client-side and show a success toast — no payment or SMTP integration.

---

## Section inventory

The page is one long vertical stack of eight sections, all centered inside the
project's standard `$layout-max-width` shell.

| # | Section                  | Figma node id (1920) | Contents                                                                                                  |
|---|--------------------------|----------------------|-----------------------------------------------------------------------------------------------------------|
| 1 | Hero video               | `1306:8089`          | 1553×794 banner with poster image + center triangle play overlay. Click-to-play `<video>`, no autoplay.   |
| 2 | "О чём мы" + Манифест    | `1306:8042`          | Two-column: heading + paragraph + button on the left, "money to books" illustration on the right.         |
| 3 | Типы изданий             | `1988:5920` + cards  | Three 400×600 cards. B&W cover image by default, color version revealed on hover. Informational only.     |
| 4 | Литжурнал Русского Динозавра | `4254:11773`     | Static collage PNG backdrop with subtle CSS pan; glassy translucent card with title/body/CTA on top.      |
| 5 | Мы (team)                | `1995:5820` instances| Right-to-left auto-scrolling strip of circular team-member photos with name / position / city captions.   |
| 6 | Наши партнёры            | `2967:7275` etc.     | Right-to-left auto-scrolling strip of partner logos in semi-translucent squares.                          |
| 7 | Задонатить Чтиву         | `2096:7428`          | Freeform number input (₽ suffix, default 3000) + submit button. Stub.                                     |
| 8 | Будьте с нами            | `3696:7978`          | Email input + submit button + validation hint. Stub.                                                      |

Sections 5–8 sit on top of a single Rorschach-inkblot PNG background
(`1930:5466` in Figma).

---

## Locked design decisions

| Topic | Decision | Why |
|---|---|---|
| Hero video | Move `public/videos/chtivo.mp4` into a new `videos` Supabase bucket under `about/`. Public read. Render `<video controls preload="none" poster="...">`. No autoplay. | Mirrors how covers/authors images already live in Supabase Storage; keeps `next build` slim. |
| Edition-type cards | **Not clickable**. B&W → color image swap on hover. No nav. | Per Figma; catalog filters already exist elsewhere. |
| Литжурнал section background | Single static collage PNG in `src/assets/about/`, subtle slow CSS pan. | Ships now without a journal-covers DB. |
| Литжурнал CTA | Links to existing `/dino-magazine` menu route (already a stub). | Avoids creating yet another stub route. |
| Workers schema | Extend existing `Workers` table — add `photo_path text`, `city text`, `is_team_member boolean NOT NULL DEFAULT false`, `sort_order integer NOT NULL DEFAULT 0`. | Reuses the table already used for book-credit workers; flag keeps the two roles cleanly separated. |
| Worker carousel | Right-to-left marquee, pause on hover, **B&W → color on hover** (CSS `filter: grayscale(1)` removed), not clickable. | Per round-2 + round-4 answers. |
| Partners | New `Partners` table (`id, name, logo_path text NULL, website_url text NULL, sort_order int NOT NULL DEFAULT 0`) + a public `partners` Supabase bucket. | Matches Subscriptions/BoxSets DB-driven pattern; lets ops add/reorder without code. |
| Partner carousel | Right-to-left marquee, pause on hover, **not clickable** for now. | Per round-2 answer. |
| Rорschach inkblot bg | Single absolute-positioned PNG under sections 5–8. | Per round-3 answer. |
| Donate form | Freeform number input with ₽ suffix. **Min 100 ₽**. Default value 3000. On submit: success toast + reset. No DB write. | Stub for future Tinkoff/CloudPayments integration. |
| Email form | Validates RFC-ish email format. Success toast + reset. No DB write. | Stub for future newsletter integration. |
| Manifest button | Links to `/manifest`, which we **also create as a ComingSoon stub in this PR**. | One-line change; lets the button work and matches `/suggest-manuscript` precedent. |
| Team seed data | Migration inserts ~6 placeholder team rows: made-up Russian names, positions, cities; `photo_path NULL` so component renders a placeholder avatar SVG. | Per round-3 answer. |
| Partner seed data | Migration inserts the 7 partners from Figma (Ночлежка, Смена, Порядок Слов, Фаренгейт 451, Ахули, Дискурс, Подписные Издания); `logo_path NULL`, component renders placeholder square. | Per round-4 answer. |

---

## Data layer changes

### Migration: `20260522170000_about_page_workers_partners.sql`

```sql
-- ─── Workers: add team-member fields ────────────────────────────────────────
ALTER TABLE "Workers"
  ADD COLUMN IF NOT EXISTS photo_path      text,
  ADD COLUMN IF NOT EXISTS city            text,
  ADD COLUMN IF NOT EXISTS is_team_member  boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order      integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS workers_team_idx
  ON "Workers" (sort_order)
  WHERE is_team_member = true;

-- ─── Partners ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "Partners" (
  id          serial  PRIMARY KEY,
  name        text    NOT NULL UNIQUE,
  logo_path   text,
  website_url text,
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE "Partners" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read partners" ON "Partners";
CREATE POLICY "Public read partners" ON "Partners" FOR SELECT USING (true);
```

### Storage buckets

Two new public buckets to declare in `supabase/config.toml` and create on
prod:

| Bucket | Purpose | File-size cap | MIME |
|---|---|---|---|
| `videos`    | `about/chtivo.mp4`, future about/manifest videos | 50 MiB | `video/mp4` |
| `partners`  | partner logos (`<slug>.svg` / `.png`)            | 2 MiB  | `image/svg+xml`, `image/png` |
| `workers`   | team-member photos (`<id>.jpg` / `.png` / `.webp`) | 2 MiB | `image/jpeg`, `image/png`, `image/webp` |

Workers' photos live in a dedicated public **`workers`** bucket (2 MiB cap,
`image/png`/`image/jpeg`/`image/webp`). Workers are their own concept, not a
subset of Authors — kept separate so RLS, lifecycle, and size caps stay
independent.

### Seed migration: `20260522170100_about_page_seed.sql`

Inserts 6 team rows with `is_team_member=true, photo_path=NULL, city='Санкт-Петербург', sort_order` 0..5,
plus the 7 partners with `logo_path=NULL`.

### Entity layer

New files under `src/entities/worker/` and `src/entities/partner/`:

```
src/entities/worker/
  client.ts        // TeamMember type
  server.ts        // QueryData<typeof teamMembersQuery>
  normalize.ts     // normalizeObject + getPhotoUrl
src/entities/partner/
  client.ts
  server.ts
  normalize.ts
```

### API modules

```
src/api/team/getTeam.ts           // SELECT from Workers WHERE is_team_member ORDER BY sort_order
src/api/partners/getPartners.ts   // SELECT from Partners ORDER BY sort_order
```

Both used as **Server Components** in the page — no TanStack Query needed,
the data never changes during a session.

---

## Component layout

```
src/app/about/
  page.tsx                        // RSC; fetches team + partners; renders sections
  AboutPage.module.scss           // page-level shell tokens (Rorschach bg, gaps)
src/app/manifest/
  page.tsx                        // ComingSoon stub (one line)

src/components/about/
  HeroVideo/                      // <video> + poster + play overlay
  AboutManifestoSection/          // section 2: text + illustration + CTA button
  EditionTypesSection/
    EditionTypesSection.tsx
    EditionTypeCard.tsx           // B&W → color image swap on hover
  JournalSection/                 // section 4: collage bg + glassy card
  TeamStrip/                      // section 5: marquee of TeamMemberCard
    TeamStrip.tsx
    TeamMemberCard.tsx
  PartnersStrip/                  // section 6: marquee of PartnerLogo
    PartnersStrip.tsx
    PartnerLogo.tsx
  DonateForm/                     // section 7
  StayWithUsForm/                 // section 8
  Marquee/                        // shared right-to-left auto-scroll, pauses on hover
```

The two marquees share a single `<Marquee>` primitive (CSS-only, duplicate
the children once for seamless loop). It accepts `speed` and renders
`children` twice; `prefers-reduced-motion` halts animation.

### Assets to drop in `src/assets/about/`

| File                        | Purpose                                           | Source |
|-----------------------------|---------------------------------------------------|---|
| `hero-poster.jpg`           | Poster frame shown until user clicks play         | Extract frame 0 from `public/videos/chtivo.mp4` with `ffmpeg` |
| `money-to-books.png`        | Section 2 illustration                            | Figma 1306:8042 child image |
| `edition-print-bw.jpg`      | Section 3 card 1 image, B&W                       | Figma `1306:8047` |
| `edition-print-color.jpg`   | Section 3 card 1 image, color (hover)             | Figma |
| `edition-book20-bw.jpg`     | Section 3 card 2 image, B&W                       | Figma `1306:8046` |
| `edition-book20-color.jpg`  | Section 3 card 2 image, color (hover)             | Figma |
| `edition-digital-bw.jpg`    | Section 3 card 3 image, B&W                       | Figma `1306:8048` |
| `edition-digital-color.jpg` | Section 3 card 3 image, color (hover)             | Figma |
| `journal-collage.jpg`       | Section 4 background collage                      | Figma `4254:11773` (export as flattened image) |
| `rorschach-bg.png`          | Inkblot background under sections 5–8             | Figma `1930:5466` |
| `team-placeholder.svg`      | Placeholder circle avatar for `photo_path IS NULL`| Hand-rolled / Figma  |
| `partner-placeholder.svg`   | Placeholder logo for `logo_path IS NULL`          | Hand-rolled |

---

## Responsive strategy

| Figma  | Width    | Project breakpoint    | Layout notes |
|--------|----------|-----------------------|---|
| 1920px | 1920     | desktop (`> 1200`)    | Full layout per spec |
| 1024px | 1024     | tablet (`≤ 1200`)     | Hero scales; Section 2 stacks; cards shrink; marquees keep speed; partners drop to 4 per visible window |
| 744px  | 744      | tablet-small (`≤ 767`)| Forms full-width; cards may scroll horizontally; collage card scales |
| 320px  | 320      | phone (`≤ 532`)       | All sections stack to single column; marquee cards shrink (~150px); form inputs full-width |

Section spacing uses existing `$space-*` tokens; per-section `padding-top` /
`padding-bottom` defined in each `*.module.scss`.

---

## Form behaviour spec

### Donate (section 7)

- Single `<input type="number" min="100" step="100">` with the `₽` symbol rendered
  as a suffix glyph inside the input chrome.
- Default value: `3000`.
- Validation: positive integer ≥ 100; otherwise inline error in Russian
  ("Минимальная сумма — 100 ₽").
- Submit handler: `e.preventDefault()` → simulate ~300 ms latency → fire a
  `cartSuccess`-style toast ("Спасибо! Вы поддержали Чтиво.") → reset input
  to default `3000`. **No network call.**

### Email signup (section 8)

- Single `<input type="email" required>`.
- Validation: react-hook-form + zod (`z.string().email('…')`).
- Validation hint is always visible under the input (matches Figma:
  "Русский Динозавр может писать только на валидные адреса электронной почты").
- Submit: validate → success toast ("Подписка оформлена") → reset.

Neither form persists to the DB. The success toast variant should be
**success** (green-on-dark accent), no cart action.

---

## Out of scope (deferred)

- Real Tinkoff / CloudPayments integration for donations.
- Real SMTP / Mailchimp signup wiring.
- Manifest page real content (`/manifest` ships as ComingSoon).
- A real journal-covers DB and dynamic collage.
- Worker detail pages.
- Partner clickthroughs (Partners.website_url column exists but unused).
- B&W → color edition-card image swap **animation** beyond a 200 ms cross-fade.
- Localization: page text is hard-coded Russian, no i18n framework involved.

---

## Tracker

Update the checkboxes as you go. Keep this section in sync with `git`.

### Phase 1 — data layer

- [x] Migration `20260522170000_about_page_workers_partners.sql` (Workers column-add + Partners table + bucket inserts).
- [x] Seed migration `20260522170100_about_page_seed.sql` (6 team rows, 7 partner rows).
- [x] `videos`, `partners`, and `workers` buckets — declared via the schema migration's `storage.buckets` insert, matching the existing `avatars` convention rather than `supabase/config.toml`.
- [x] Move `public/videos/chtivo.mp4` → `videos/about/chtivo.mp4` (`scripts/upload-about-video.mjs`); local copy deleted.
- [x] Regenerated `src/types/supabase.ts`.
- [x] `src/entities/worker/` (client/server/normalize) for team members.
- [x] `src/entities/partner/` (client/server/normalize).
- [x] `src/api/team/getTeam.ts`.
- [x] `src/api/partners/getPartners.ts`.

### Phase 2 — shared primitives

- [x] `src/components/about/Marquee/` (CSS-only RTL scroller, pause-on-hover, respects `prefers-reduced-motion`).
- [x] Figma frames exported via Figma MCP into `src/assets/about/` (hero illustration, money-to-books, edition images, journal collage, Rorschach).
- [x] Hero poster: the Figma hands illustration replaces the ffmpeg frame-0 approach; renders behind the `<video>` `poster` attribute. No ffmpeg poster shipped.

### Phase 3 — sections (top to bottom)

- [x] Section 1 — `HeroVideo` (`<video>` + poster + play overlay).
- [x] Section 2 — `AboutManifestoSection` (text column + illustration + CTA → `/manifest`).
- [x] `/manifest` ComingSoon stub.
- [x] Section 3 — `EditionTypesSection` + `EditionTypeCard` (CSS grayscale filter on the same image, removed on hover).
- [x] Section 4 — `JournalSection` (collage bg with subtle CSS pan + glassy card + CTA → `/dino-magazine`).
- [x] Section 5 — `TeamStrip` + `TeamMemberCard` (marquee, grayscale → color on hover, placeholder avatar).
- [x] Section 6 — `PartnersStrip` + `PartnerLogo` (marquee, translucent square, placeholder fallback).
- [x] Section 7 — `DonateForm` (number input, min 100 ₽, success toast).
- [x] Section 8 — `StayWithUsForm` (email input, RHF + zod, success toast).

### Phase 4 — page composition + polish

- [x] `src/app/about/page.tsx` rewritten as RSC fetching `getTeam()` + `getPartners()` and composing the eight sections.
- [x] Rorschach background image positioned under sections 5–8 (`AboutPage.module.scss`).
- [x] Verified desktop (1646w), tablet (1024w), and phone (500w) in dev.
- [x] Metadata (page title + description) in `src/app/about/page.tsx`.
- [x] Lint clean; `npx tsc --noEmit` reports no new errors (only pre-existing `getBooks.ts` RPC typing issue).

### Phase 5 — verification

- [x] `npm run dev`, walked `/about` at three widths (desktop, tablet, phone).
- [x] Hero video plays against the local Supabase bucket URL — confirmed via `video.play()` (currentTime advanced).
- [x] Marquees animate (computed transform changes over 250 ms) and pause on hover.
- [x] Donate form: zod schema enforces `min(100)`; default 3000; submit resets.
- [x] Email form: zod `.email()`; valid path resets, invalid path swaps placeholder hint for red error.
- [x] `/manifest` route renders the `ComingSoon` stub; reachable via section 2 CTA.

---

## Open questions — all resolved

1. **Worker-photo bucket**: dedicated `workers` bucket. Workers are their own
   entity, not an Authors subset.
2. **Hero video poster**: extracted from `public/videos/chtivo.mp4` frame 0
   with `ffmpeg` and committed at `src/assets/about/hero-poster.jpg`.
3. **Figma asset exports**: I'll pull them via the Figma MCP server during
   Phase 2.
