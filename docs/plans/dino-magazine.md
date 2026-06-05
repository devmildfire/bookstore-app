# Литжурнал Русского Динозавра — implementation plan

The `/dino-magazine` section adds a new editorial surface to Чтиво: a
masonry feed of article cards, and per-article detail pages with body,
author bio, "more by this author" carousel, and an author-books row.

Figma source of truth:
- 1920 index — `2919:7776`
- 1024 index — `5155:16198`
- 744 index — `5200:12793`
- Article detail (1920) — `2996:7370`

File key: `CZwt15WEQ3Qugfy2NM1CPy`. Pull live dimensions/padding via
`get_design_context` rather than hardcoding values copied from this
doc — it's a summary, not authoritative.

---

## Goal

1. New entity **Article** (single author, ordered body blocks of
   paragraphs + illustrations, optional excerpt, cover image).
2. **/dino-magazine** — full-bleed masonry feed of cover cards with a
   bottom overlay (title, author, excerpt). Infinite scroll.
3. **/dino-magazine/[slug]** — title + author + body + author bio +
   carousel of more articles + author's books.

The "Журнал Русского Динозавра" link already exists in
`src/consts/menuItems.ts` pointing at `/dino-magazine`, so the header
nav requires no change.

---

## Locked decisions

| Concern | Decision |
|---|---|
| **Body model** | Single JSONB array `content_blocks` of typed blocks: `{kind:'paragraph', text}` or `{kind:'image', path, caption}`. Order is the only sequence; reordering is a simple in-array swap. |
| **Tile sizing** | Natural-aspect masonry. No `tile_size` field on the article. Each card renders at its cover image's intrinsic aspect ratio; the layout balances columns by stacking-shortest. |
| **Sort** | Newest first by `(published_at DESC, id DESC)`. **No** "Новые / Популярные" tabs in V1. |
| **Carousel fallback** | "Другие рассказы автора" always shows ≥3 slides and loops. Same-author articles first; if the author has fewer than 3 other articles, top up with the most recent articles by *any* other author. |
| **URL slug** | Hand-curated `slug text UNIQUE NOT NULL`. URLs stay stable when the title is edited. Russian transliteration is the editor's call, not the app's. |
| **Pagination** | Infinite scroll via `IntersectionObserver`. Articles are batched into separate (visually invisible) containers — each batch lays out its own masonry. When the user crosses the **midpoint** of the latest batch, the next batch is fetched and mounted as its own container. Containers themselves render no chrome. |
| **Authorship** | Single author per article. `Articles.author_id integer NOT NULL REFERENCES Authors(id) ON DELETE RESTRICT`. Multi-author co-bylines are out of scope. |
| **Image storage** | New public `articles` Storage bucket. `Articles.cover_path` and each image block's `path` store **bare filenames**. URLs are built at runtime via a new `getArticleImageUrl(filename)` helper, mirroring the `covers` / `subscriptions` / `gift-cards` pattern. |

---

## Data layer

### Migration: `supabase/migrations/20260530120000_articles.sql`

```sql
-- Articles: editorial pieces displayed under /dino-magazine.
-- One author per article; body is a sequenced list of paragraph and
-- image blocks.
CREATE TABLE IF NOT EXISTS "Articles" (
  id              serial      PRIMARY KEY,
  slug            text        NOT NULL UNIQUE,
  title           text        NOT NULL,
  author_id       integer     NOT NULL REFERENCES "Authors"(id) ON DELETE RESTRICT,
  cover_path      text,                       -- bare filename in `articles` bucket
  cover_blur      text,                       -- 10×15 JPEG q40 base64 data URL (next/image blur placeholder)
  excerpt         text,                       -- optional teaser shown in the masonry overlay
  content_blocks  jsonb       NOT NULL DEFAULT '[]'::jsonb,
  published_at    timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_blocks_is_array
    CHECK (jsonb_typeof(content_blocks) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_articles_published_desc
  ON "Articles" (published_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_articles_author
  ON "Articles" (author_id);

ALTER TABLE "Articles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read articles" ON "Articles"
  FOR SELECT USING (true);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'articles', 'articles', true, 20971520,
  ARRAY['image/jpeg','image/png','image/webp','image/avif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
CREATE POLICY "Public read article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'articles');
```

**Block shape** (enforced in app code, not in SQL — JSONB is intentionally permissive):

```ts
type ParagraphBlock = { kind: 'paragraph'; text: string }
type ImageBlock     = { kind: 'image'; path: string; caption: string | null }
type ContentBlock   = ParagraphBlock | ImageBlock
```

### Type regeneration

After applying:

```bash
supabase gen types typescript --db-url "postgresql://postgres:postgres@127.0.0.1:54322/postgres" 2>/dev/null > src/types/supabase.ts
```

---

## Entity layer

`src/entities/article/`:

- **`server.ts`**
  ```ts
  export type ArticleRow =
    Database['public']['Tables']['Articles']['Row'] & {
      Authors: Database['public']['Tables']['Authors']['Row'] | null
    }
  ```

- **`client.ts`**
  ```ts
  export type ArticleAuthor = {
    id: number
    name: string
    photoUrl: string | null
    photoBlurDataUrl: string | null
    bio: string | null
    birthDate: string | null
    city: string | null
  }

  export type ContentBlock =
    | { kind: 'paragraph'; text: string }
    | { kind: 'image'; path: string; imageUrl: string; caption: string | null }

  export type Article = {
    id: number
    slug: string
    title: string
    coverUrl: string | null
    coverBlurDataUrl: string | null
    excerpt: string | null
    publishedAt: string
    author: ArticleAuthor
    contentBlocks: ContentBlock[]
  }

  // Light shape used by cards / carousel slides — no body, no full bio.
  export type ArticleSummary = Omit<Article, 'contentBlocks' | 'author'> & {
    author: Pick<ArticleAuthor, 'id' | 'name'>
  }
  ```

- **`normalize.ts`** — `normalizeArticle(raw)`, `normalizeArticleSummary(raw)`, and a defensive `normalizeContentBlocks(jsonb)` that filters unknown kinds and ignores malformed entries (so a bad block can't crash render).

---

## API modules

`src/api/articles/`:

- **`getArticlesPage.ts`** — keyset paginated list, server-only:
  ```ts
  type Cursor = { publishedAt: string; id: number } | null
  type Page   = { items: ArticleSummary[]; nextCursor: Cursor }

  export async function getArticlesPage(
    cursor: Cursor,
    pageSize = 12,
  ): Promise<Page>
  ```
  Implementation: `SELECT … FROM "Articles" JOIN "Authors" … ORDER BY published_at DESC, id DESC LIMIT pageSize+1 [WHERE (published_at, id) < (cursor.publishedAt, cursor.id)]`. `nextCursor` is the last item's `(published_at, id)` if the result was truncated.

- **`getArticleBySlug.ts`** — full article + author profile.

- **`getMoreArticlesForAuthor.ts`** — same-author articles first, ordered newest; top up with other authors to always return ≥ 3 (cap at e.g. 12). Excludes the current article.

- **`getAuthorBooks.ts`** — reuses the existing `Titles_Authors` join; returns the same `Book` shape used by the catalog so the existing book card can render the row directly.

- **`getArticlesPageAction.ts`** — `'use server'` wrapper around `getArticlesPage` for client-side next-batch fetches via `useInfiniteQuery`.

---

## Storage helper

`src/lib/storage.ts`:

```ts
const ARTICLES_BUCKET = 'articles'

export function getArticleImageUrl(filename: string | null): string | null {
  if (!filename) return null
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename
  return `${supabaseUrl}/storage/v1/object/public/${ARTICLES_BUCKET}/${filename}`
}

export { ARTICLES_BUCKET }
```

`next.config.ts` `remotePatterns` already covers the supabase host;
no change.

---

## Routes

### `src/app/dino-magazine/page.tsx` (Server Component)

```tsx
export const metadata: Metadata = {
  title: 'Литжурнал Русского Динозавра',
  description: '…',
}

export default async function DinoMagazinePage() {
  const firstPage = await getArticlesPage(null)
  return (
    <main className={styles.page}>
      <DinoMagazineHero />
      <ArticlesFeed initialPage={firstPage} />
    </main>
  )
}
```

### `src/app/dino-magazine/[slug]/page.tsx` (Server Component)

- `generateMetadata` reads title/excerpt for OG tags.
- Fetches article, more-articles list, author-books list in parallel.
- 404s via `notFound()` if the slug doesn't exist.

```tsx
export default async function ArticleDetailPage({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()
  const [more, books] = await Promise.all([
    getMoreArticlesForAuthor(article.author.id, article.id),
    getAuthorBooks(article.author.id),
  ])
  return (
    <article className={styles.page}>
      <ArticleHeader title={article.title} authorName={article.author.name} />
      <ArticleBody blocks={article.contentBlocks} />
      <ArticleAuthorCard author={article.author} />
      <ArticleCarousel items={more} />
      {books.length > 0 && <AuthorBooksRow books={books} />}
    </article>
  )
}
```

---

## Component layout

`src/components/articles/`:

### `DinoMagazineHero/`

- Small dinosaur SVG (~ 52×73 desktop, scales down) sits above the title.
- Title in Cheque Black, uppercase, centered. Sizes per Figma:
  60px / 40px / 30px at desktop / tablet / phone.
- Top + bottom padding matching the Figma spacing above the masonry.
- Uses the project's `page-container` mixin for horizontal alignment of the title — the masonry itself does NOT live inside the page-container (it goes edge-to-edge on this page, matching the Figma).

### `ArticleCard/`

- `next/image` cover with the article's intrinsic aspect ratio (read at upload time, stored in SCSS via `aspect-ratio: var(--ar)` inline style, fallback `aspect-ratio: 3 / 2`).
- Bottom overlay: full-card-width `rgba(0,0,0,0.85)` block.
  - **Title line**: Montserrat Bold, white, `«{title} | {authorName}»` pattern from the Figma.
  - **Excerpt**: rendered below the title when `excerpt !== null`, Montserrat Regular, `rgba(220,220,220,1)`, `line-height: 1.6`, **3-line clamp** via `-webkit-line-clamp`.
  - Title/excerpt font sizes scale by tile size class (`tileLg`/`tileMd`/`tileSm`) — the masonry packer (below) tags each card based on the column width it ended up in, so font sizes track tile width without an editor-controlled enum.
- Whole card wrapped in `<Link href={`/dino-magazine/${slug}`}>` with `display: contents` semantics so the entire surface is clickable.

### `ArticleBatch/` (Client Component)

- Renders one batch of articles as a standalone masonry.
- Column count: 3 desktop (≥ 1200) / 2 tablet (768–1199) / 2 tablet-small (533–767) / 1 phone (≤ 532).
  - The 744 Figma shows 2 columns; the 1024 Figma shows 2 columns; the 1920 Figma shows 3 columns. So thresholds: 3 ≥ 1200, 2 between 533–1199, 1 ≤ 532.
- Column-balancing distribution: pure JS, deterministic, runs at render time so SSR == client. For each article, compute its expected height in column units from `cover.aspect_ratio` + body-overlay reserve, then push onto the shortest column.
- The midpoint sentinel (an empty `<div ref={ref}/>`) is rendered immediately after item `Math.floor(items.length / 2)`. The parent `ArticlesFeed` attaches the `IntersectionObserver` only to the **latest** batch's sentinel.

### `ArticlesFeed/` (Client Component)

- `useInfiniteQuery` keyed on `['articles', 'feed']`.
- `initialPageParam: null`; `initialData` is the server-rendered first page (so the client and server agree).
- `getNextPageParam` returns the batch's `nextCursor`.
- Renders each page as one `<ArticleBatch>`.
- When `IntersectionObserver` fires on the **latest** batch's midpoint sentinel and `hasNextPage && !isFetchingNextPage` → `fetchNextPage()`.
- Trailing skeleton row of 3 placeholder cards while a batch is in flight; nothing rendered once `!hasNextPage`.
- Empty state (zero articles total): `<p>Пока ничего нет</p>` centred.

### `ArticleHeader/`

- Centred. Title — Montserrat Bold, 40px desktop / 32px tablet / 24px phone (track Figma 2996:7376 ratios). Author name — Montserrat Bold, 30px / 24px / 20px below the title.

### `ArticleBody/`

- Outer container max-width 1200px (Figma body is 1201 — round down), centred via `margin: 0 auto`.
- Renders `contentBlocks` in order:
  - `paragraph`: `<p>` Montserrat Regular 18px, line-height 1.6, color `#fff`, margin-bottom matching Figma spacing.
  - `image`: `next/image` at the article's body width; `object-fit: contain`. When `block.caption` is non-null, render a captioned strip *overlaid on the bottom of the image* — `rgba(0,0,0,0.8)`, 46px tall, Montserrat Regular 18px, right-padded.
- All on phone: body collapses to `padding: 0 16px` and image becomes full-bleed within that padding.

### `ArticleAuthorCard/`

- Reuses `Authors` photo/bio/birth_date/city.
- Desktop: two columns — circular photo 343×343 on the left, name + `dd.mm.yyyy | city` + bio on the right.
- Tablet/phone: stacks vertically; photo shrinks to 200px on phone.
- Bio is `Authors.bio` text rendered verbatim (no Markdown).

### `ArticleCarousel/` ("Другие рассказы автора")

- Heading centred at the page container's max-width.
- Swiper itself escapes the page container — `width: 100vw; margin-left: calc(50% - 50vw)` so the carousel is full-bleed.
- `slidesPerView: 3`, `centeredSlides: true`, `loop: true`, `spaceBetween: 0` (the Figma shows cards butt-up-to-each-other across the viewport edge); side slides are partially clipped by the viewport, which is exactly how the existing subscriptions carousel handles its phone view.
- On tablet ≤ 1024: `slidesPerView: 2.2` with centered slide. On phone: `slidesPerView: 1.4`.
- Each slide reuses `ArticleCard` (the same component used in the masonry).
- The list passed in is already the merged `same-author + other-authors top-up` array from the API.

### `AuthorBooksRow/` ("Книги автора")

- Heading centred.
- Reuses the existing book card component (the storefront one) so prices/discounts behave identically.
- 1–N books, centered row, wraps on narrower viewports.
- Section omitted entirely when the author has no published books.

---

## Responsive strategy

| Breakpoint | Hero title | Masonry columns | Card overlay font |
|---|---|---|---|
| `≥ 1200` (desktop) | 60px | 3 | title 20px / excerpt 20px on `lg` tiles, 16px / 14px on `sm` |
| `768–1199` (tablet) | 40px | 2 | title 16px / excerpt 14px |
| `533–767` (tablet-small) | 32px | 2 | title 14px / excerpt 12px |
| `≤ 532` (phone) | 30px | 1 | title 14px / excerpt 12px |

---

## Out of scope (deferred)

- ~~Editorial CMS / admin UI — articles seeded via Supabase Studio or SQL inserts for V1.~~
  **Now built:** `/admin/articles` (create/edit/delete, cover upload, minimal
  Lexical body editor). See [admin-panel-tracker.md](./admin-panel-tracker.md) Phase 7.
- View-count tracking and the "Популярные" tab.
- Comments, likes, share buttons.
- Tags / categories / topic filters.
- Drafts, scheduled publication, soft delete.
- Article-level Open Graph image overrides (defaults to `cover_path`).
- Reading-time estimation.
- Search across article bodies (not currently indexed).
- RSS feed.
- Multi-author co-bylines.

---

## Tracker

> **Status: Shipped.** All phases below landed — storefront `/dino-magazine`
> index (masonry feed) + `/dino-magazine/[slug]` detail, the `Articles` table +
> `articles` bucket (migration `20260530120000_articles.sql`), the full
> `src/api/articles/*` + `src/components/articles/*` layers, and the blur
> scripts. Editing is now via `/admin/articles` (see Phase 7 of the admin
> tracker). The unchecked boxes below are the original build checklist, left as
> the historical breakdown.

Update the checkboxes as work progresses. Each phase is shippable on its
own; a half-complete tracker is enough context to resume in a fresh
conversation.

### Phase 1 — data layer

- [ ] Migration `20260530120000_articles.sql`: `Articles` table + indexes + RLS public-read + `articles` storage bucket + public read policy.
- [ ] Regenerate `src/types/supabase.ts`.
- [ ] Seed at least 1 article (real or placeholder) via SQL using an existing Author and uploaded sample images — gives the index page something to render during dev.

### Phase 2 — entity + API

- [ ] `src/entities/article/{server,client,normalize}.ts`.
- [ ] `getArticleImageUrl()` added to `src/lib/storage.ts`.
- [ ] `src/api/articles/getArticlesPage.ts` — keyset-paginated list.
- [ ] `src/api/articles/getArticleBySlug.ts`.
- [ ] `src/api/articles/getMoreArticlesForAuthor.ts` — same-author + other-author top-up to ≥ 3.
- [ ] `src/api/articles/getAuthorBooks.ts` — reuses `Titles_Authors`.
- [ ] `src/api/articles/getArticlesPageAction.ts` — `'use server'` wrapper for the infinite-scroll client.

### Phase 3 — index page

- [ ] `src/components/articles/DinoMagazineHero/` (logo SVG + Cheque title).
- [ ] `src/components/articles/ArticleCard/` (cover + overlay, 3-line excerpt clamp, font-size scaling by tile tag).
- [ ] `src/components/articles/ArticleBatch/` (column-balanced JS masonry — deterministic, SSR-safe).
- [ ] `src/components/articles/ArticleFeedSentinel/` — invisible `<div>` at midpoint, only the latest batch's sentinel is observed.
- [ ] `src/components/articles/ArticlesFeed/` — `useInfiniteQuery`, `IntersectionObserver`, skeleton row.
- [ ] `src/app/dino-magazine/page.tsx` (server) — metadata + first batch.
- [ ] Page-level SCSS.

### Phase 4 — detail page

- [ ] `src/components/articles/ArticleHeader/`.
- [ ] `src/components/articles/ArticleBody/` (paragraph/image block renderer, captioned-image overlay).
- [ ] `src/components/articles/ArticleAuthorCard/` (circular photo + bio).
- [ ] `src/components/articles/ArticleCarousel/` (full-bleed swiper, loop, 3-up desktop).
- [ ] `src/components/articles/AuthorBooksRow/` (reuses storefront book card; hidden when empty).
- [ ] `src/app/dino-magazine/[slug]/page.tsx` (server) — `generateMetadata`, `notFound()`, parallel fetches.

### Phase 5 — scripts + polish

- [ ] `scripts/upload-articles-to-supabase.mjs` — generic uploader for cover + inline images (mirror existing uploaders).
- [ ] `scripts/sync-article-blurs.mjs` — backfill `Articles.cover_blur` from the `articles` bucket (mirror `sync-cover-blurs.mjs`).
- [ ] Lint + tsc clean.

### Phase 6 — verification

- [ ] Masonry packs without overlap at 1920 / 1280 / 1024 / 744 / 532 widths.
- [ ] Infinite-scroll fires at the **midpoint** of the latest batch, not the end; next batch appears as its own grouped container; column heights reset across batch boundaries (intentional).
- [ ] Skeleton row visible while a batch is in flight; nothing rendered after `!hasNextPage`.
- [ ] Article detail renders all paragraph blocks and at least one captioned image block correctly.
- [ ] Author bio card renders photo (circular) + birth/city + bio paragraph; layout stacks on phone.
- [ ] Carousel loops with 3 visible; side slides partially clipped; carousel goes edge-to-edge.
- [ ] When the test author has only 1 article, the carousel still shows ≥ 3 slides filled from other authors.
- [ ] "Книги автора" row shown for an author with books, omitted for an author without.
- [ ] Header nav link → `/dino-magazine` works.
- [ ] All article images served via `next/image` with blur placeholders where available.

---

## Open questions — all resolved

1. **Body model** — JSONB ordered block list.
2. **Tile sizing** — natural-aspect masonry; no editor field.
3. **Sort tabs** — none in V1; newest first.
4. **Carousel fallback** — fill from other authors when same-author count < 3.
5. **URL slug** — hand-curated `slug` column.
6. **Pagination** — `IntersectionObserver` infinite scroll, batched containers, midpoint trigger.
7. **Authorship** — single author per article.
8. **Image storage** — single public `articles` bucket; bare filenames; `getArticleImageUrl()` helper.
