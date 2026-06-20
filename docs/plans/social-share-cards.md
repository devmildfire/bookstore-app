# Social Share Cards — Open Graph, X, Telegram

Status: **planned**.

## Goal

Add page-aware social sharing metadata and generated card images for the first public sharing
surfaces:

- Homepage (`/`) — generic Чтиво brand card.
- Book detail (`/books/[slug]`) — book cover, title, author(s), Чтиво branding.
- Author detail (`/authors/[id]`) — author photo, name, Чтиво branding.
- Article detail (`/dino-magazine/[slug]`) — article cover, title, author, Чтиво branding.

Cards must be generated dynamically by the app for now, with cache headers suitable for Cloudflare
CDN caching. Source content changes rarely, so a multi-hour cache is acceptable.

## References

- Next.js supports route-level generated `opengraph-image` and `twitter-image` files, including
  programmatic image generation with `ImageResponse`, multiple generated image variants through
  `generateImageMetadata`, and automatic metadata tags for width, height, type, and alt text:
  https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
- Next.js `ImageResponse` supports route handlers, file-based metadata images, and custom fonts:
  https://nextjs.org/docs/app/api-reference/functions/image-response
- Open Graph requires `og:title`, `og:type`, `og:image`, and `og:url`; supports structured
  `og:image:width`, `og:image:height`, `og:image:alt`; and supports multiple image tags where the
  first tag is preferred:
  https://ogp.me/

## Locked Decisions

| Topic | Decision |
| --- | --- |
| Production origin | `https://bookstore-app.mildfire.dev` |
| Generation model | Dynamic Next.js image routes, not pre-generated storage files |
| CDN model | Emit public cache headers so Cloudflare can cache generated PNGs |
| Page scope | Homepage, book detail, author detail, article detail only |
| Language | Russian-only, using exact stored titles and names |
| Fallback | Generic Чтиво branded fallback card if page image data is missing |
| Update freshness | Cached for hours is acceptable |
| QA | Include a local visual gallery plus manual social-preview checks |

## Metadata Strategy

Use the existing Next Metadata API only. Do not add `next/head` or `next-seo`.

For each target page:

- Keep or add `title`, `description`, `openGraph`, and `twitter`.
- Set `openGraph.url` to the canonical page URL under `https://bookstore-app.mildfire.dev`.
- Set `openGraph.siteName = 'Чтиво'` and `openGraph.locale = 'ru_RU'`.
- Use `openGraph.type = 'website'` for homepage and author pages.
- Use `openGraph.type = 'book'` for book pages where Next metadata supports it cleanly; otherwise
  use `website` plus the page-aware image.
- Use `openGraph.type = 'article'` for article pages.
- Use `twitter.card = 'summary_large_image'` as the primary X card.
- Provide image alt text for every generated image.

Multiple Open Graph images are valid and useful, but they are not a strict device-selection API.
The first image remains the preferred image, and platforms choose their own crawler/rendering
behavior. Therefore the order should be deliberate:

1. Primary wide Open Graph card.
2. Square fallback card.
3. Compact/small fallback card if the platform honors extra image tags.

For X, keep one preferred `twitter:image` per card type when using file conventions, and expose the
other generated variants through the QA gallery and direct URLs. If implementation testing proves
Next emits multiple `twitter:image` tags reliably and X accepts them, add multiple X image entries.

## Initial Card Variants

| Variant id | Size | Purpose | Notes |
| --- | ---: | --- | --- |
| `og-wide` | `1200x630` | Open Graph, Telegram, Facebook, LinkedIn-style large previews | Primary OG image, first in `openGraph.images` |
| `og-square` | `1200x1200` | Square/cropped previews and messengers that prefer square media | Designed separately, not a blind crop |
| `x-wide` | `1200x675` | X large preview, 16:9-friendly layout | Primary `twitter:image` for `summary_large_image` |
| `x-square` | `800x800` | X compact/summary-style fallback and QA | Use if we later support `summary` card variants |
| `compact` | `800x418` | Compact landscape preview fallback | Optional secondary OG image; downscaled from wide layout only if it remains legible |

This is enough for the first implementation. We should not create many near-duplicate sizes until
real preview testing shows a concrete platform crop problem.

## Image Route Shape

Prefer a shared renderer rather than one-off route logic.

Proposed files:

```text
src/lib/socialCards/
  cardTypes.ts
  getSocialCardUrl.ts
  renderSocialCard.tsx
  textFit.ts
  imageData.ts

src/app/(site)/opengraph-image.tsx
src/app/(site)/twitter-image.tsx
src/app/(site)/books/[slug]/opengraph-image.tsx
src/app/(site)/books/[slug]/twitter-image.tsx
src/app/(site)/authors/[id]/opengraph-image.tsx
src/app/(site)/authors/[id]/twitter-image.tsx
src/app/(site)/dino-magazine/[slug]/opengraph-image.tsx
src/app/(site)/dino-magazine/[slug]/twitter-image.tsx
```

If Next file conventions become too restrictive for the full variant set, use explicit route
handlers instead:

```text
src/app/api/social-card/[kind]/[variant]/route.ts
```

and reference those URLs from `generateMetadata()`. The file-convention route is preferred because
it lets Next emit the correct metadata automatically, but explicit routes are acceptable if they
make cache headers and multi-variant metadata cleaner.

## Card Design Direction

Use the existing dark Чтиво storefront language:

- Dark textured/solid background using current brand colors.
- Чтиво logo as a consistent brand anchor.
- Chequeblack-style display title where font support is reliable in `ImageResponse`.
- Montserrat for supporting text.
- Strong page object: book cover, author photo, or article image.
- Layouts vary by page type instead of forcing one template:
  - Homepage: mostly brand and editorial mood, no page object.
  - Book: cover large, title and author balanced beside it.
  - Author: portrait dominant, name and “автор Чтиво”.
  - Article: editorial image background or side visual, title and author.

Text should fit rather than be clipped:

- Prefer two- or three-line title regions.
- Use deterministic font-size tiers based on character count.
- Use line-clamp only as a final guard.
- Keep author/name text exact as stored.

## Data Strategy

Use existing API/entity functions:

- Books: `getBook(slug)` already used by book `generateMetadata()`.
- Authors: `getAuthor(id)` already used by author `generateMetadata()`.
- Articles: `getArticleBySlug(slug)` already used by article `generateMetadata()`.

Do not call Supabase directly from image routes if an existing API function provides the normalized
shape. Add narrow API helpers only when the existing functions over-fetch heavily or are awkward in
`ImageResponse` routes.

For remote Supabase Storage images:

- Use public image URLs already exposed by normalizers.
- If `ImageResponse` cannot reliably load a remote image in production, add a tiny server-side
  fetch helper that loads bytes and embeds them as data URLs.
- Missing or failed images fall back to the generic brand art, never to a broken social card.

## Caching

Target headers for dynamic image responses:

```text
Cache-Control: public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400
```

Rationale:

- Browser cache: 1 hour.
- CDN cache: 6 hours.
- Stale while revalidate: 24 hours.

If Next file metadata routes prevent custom headers, use explicit route handlers for image
generation and link to those from `generateMetadata()`.

## Preview Gallery

Build a QA gallery that renders every variant for representative pages:

- Homepage.
- One book with a long title.
- One book with a short title.
- One author with photo.
- One author missing photo, if fixture exists.
- One article with long title.
- One article missing cover, if fixture exists.

Proposed route:

```text
src/app/admin/(panel)/social-cards/page.tsx
```

Why admin instead of public/dev-only:

- It can reuse admin auth.
- It avoids leaking internal QA pages publicly.
- It can show live production URLs for copy/paste into validators.

Gallery requirements:

- Show each variant at natural aspect ratio.
- Show exact image URL under each preview.
- Show expected meta tags for the selected page.
- Include quick links to the live page, Open Graph debugger, X card validator if available, and
  Telegram manual test instructions.

Browser extensions can be part of QA, but the gallery is the primary repeatable check because it
exercises every generated variant at once.

## Manual QA Checklist

- View page HTML and confirm `og:title`, `og:description`, `og:url`, `og:image`,
  `og:image:width`, `og:image:height`, `og:image:alt`, `twitter:card`, `twitter:title`,
  `twitter:description`, and `twitter:image`.
- Open every generated image URL directly and confirm status `200`, `Content-Type: image/png`, and
  expected cache headers.
- Use the QA gallery on desktop and mobile viewport widths.
- Share test links manually in Telegram and verify the card is page-aware.
- Run the Facebook/Open Graph debugger for homepage, one book, one author, and one article.
- Run X preview tooling if available; if not available, inspect tags and manually post/share in a
  private test context.
- Validate the first Open Graph image is the desired primary image because OG parsers prefer the
  first image when multiple images exist.
- Confirm missing page images use the generic Чтиво fallback.
- Confirm long Russian titles fit and remain readable.
- Confirm `npm run lint`, `npx tsc --noEmit`, and `npm run build`.

## Tracker

Legend: ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked

| Phase | Status | Work |
| --- | --- | --- |
| P0 — Final spec lock | ✅ | Decisions captured: dynamic generation, target origin, page scope, cache tolerance, variants, gallery |
| P1 — Renderer foundation | ⬜ | Shared social-card types, variant constants, absolute URL helper, text fitting, generic fallback layout |
| P2 — Homepage cards | ⬜ | Generate generic Чтиво cards for OG and X variants; wire homepage metadata |
| P3 — Book cards | ⬜ | Generate book page cards using cover/title/author; wire book metadata; handle periodical fallback if encountered |
| P4 — Author cards | ⬜ | Generate author page cards using photo/name; wire author metadata |
| P5 — Article cards | ⬜ | Generate article page cards using cover/title/author; wire article metadata |
| P6 — Cache behavior | ⬜ | Ensure image responses emit CDN-friendly cache headers or switch to explicit route handlers |
| P7 — Preview gallery | ⬜ | Add admin-only social-card gallery with all variants and sample pages |
| P8 — Verification | ⬜ | HTML tag inspection, direct image checks, gallery screenshots, Telegram/X/OG manual preview, lint/tsc/build |
| P9 — Deployment notes | ⬜ | Record deployed SHA, confirm Cloudflare caches image routes, document invalidation path if needed |

## Open Risks

- Platform crawlers do not guarantee device-specific selection from multiple `og:image` entries.
  Multiple images are still useful, but order and first-image quality matter most.
- X documentation around card preview tooling has moved over time; implementation should verify
  the actual live metadata output and not depend on outdated validator URLs.
- `ImageResponse` CSS support is not identical to browser CSS. Keep layouts simple: flexbox,
  absolute positioning, inline styles, no SCSS modules.
- Remote image loading inside generated image routes may fail depending on runtime/network path.
  Keep a fallback and test against production storage URLs.
- Generated PNG size must stay below platform/file-convention limits; avoid oversized embedded
  photos and heavy effects.
