# Social Share Cards

Status: **implemented locally; verification in progress**.

## Scope

- Homepage: generic Чтиво brand card.
- Book detail: title, author, cover when available.
- Author detail: name, city/bio, photo when available.
- Article detail: title, author, cover when available.

## Implementation

- Dynamic image route: `src/app/api/social-card/[kind]/[variant]/[[...target]]/route.ts`.
- Shared renderer/data: `src/lib/socialCards/`.
- Admin QA gallery: `src/app/admin/(panel)/social-cards/page.tsx`.
- Cache header: `public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400`.

## Variants

| Variant | Size | Use |
| --- | ---: | --- |
| `og-wide` | `1200x630` | Primary Open Graph image |
| `og-square` | `1200x1200` | Square Open Graph fallback |
| `x-wide` | `1200x675` | `summary_large_image` X/Twitter card |
| `compact` | `800x418` | Compact Open Graph fallback |

## QA

- Confirm page HTML emits `og:title`, `og:description`, `og:url`, `og:image`, image width/height/alt, `twitter:card`, and `twitter:image`.
- Open each generated image URL and confirm `200`, `Content-Type: image/png`, and the cache header.
- Check `/admin/social-cards` on desktop and mobile widths.
- Manually share homepage, one book, one author, and one article in Telegram/X/OG preview tooling.
- Run `npm run lint`, `npx tsc --noEmit --incremental false`, and `npm run build`.

## Remaining

- **Redesign the card visuals.** The current card layout/colors in `renderSocialCard.tsx`
  are a working prototype, not final design — replace with a proper designed treatment.
- Verify with production data and production `NEXT_PUBLIC_BASE_URL`.
- Record deployed SHA after merge.
- Confirm Cloudflare caches `/api/social-card/*` responses.
