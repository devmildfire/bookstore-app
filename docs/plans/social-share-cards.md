# Social Share Cards

Status: **redesigned per Claude-design handoff; verified locally; production promotion pending**.

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
- **Resilient render:** the route renders eagerly to a buffer inside try/catch; if satori
  fails on a cover/photo (some source images are huge or have headers resvg rejects — e.g. a
  3200×4800 PNG threw "corrupt header"), it re-renders the card WITHOUT the image so the route
  returns a text-only card instead of streaming a broken response (which the gateway turns into
  a 502). Oversized source covers should still be optimized so their cards show the artwork.
- Card art: redesigned from the Claude-design handoff — real 5-diamond ЧТИВО glyph +
  Cheque wordmark, flat near-black surface, single red accent, 3-leaf «Русский Динозавр»
  mark on литжурнал/рассказ kickers, author photo in a ring-less circle. Fonts: Cheque +
  Montserrat 400/700 (loaded in `route.ts`).
- **satori gotchas hit & fixed during wiring** (keep in mind if editing `renderSocialCard.tsx`):
  brand marks are inline `<svg>` with explicit `width`/`height` (satori scales the viewBox);
  never set a style value to `undefined` (e.g. `right: cond ? 0 : undefined`) — satori calls
  `.trim()` on every value and crashes on `undefined`, so spread the key in conditionally;
  every `<div>` wrapping children needs explicit `display: 'flex'`; **satori does not center a
  near-full-width child via `justify-content: center`, and cannot size an `inset:0` absolute box**
  — the home watermark is positioned with an explicit computed `left`/`top` from the card size.

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

- Promote `update` → `production` to deploy (held by choice; redesign now done).
- Verify with production data and production `NEXT_PUBLIC_BASE_URL`.
- Record deployed SHA after merge.
- Confirm Cloudflare caches `/api/social-card/*` responses.
