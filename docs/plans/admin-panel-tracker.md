# Admin Panel — Progress Tracker

Living checklist for the [admin-panel plan](./admin-panel.md). Update this file
as work proceeds so an interrupted session can resume without re-deriving state.

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked

---

## ▶️ Resume here

- **Status: ALL PHASES COMPLETE (0–8).** The admin panel covers auth/roles,
  orders, the full book graph, featured curation, authors, box sets, gift cards,
  subscriptions, promo codes, editorial (articles + submissions), the audit
  viewer, and a live dashboard. Remaining optional/deferred items are listed
  under "Deferred / future" below.
- **Last phase:** Phase 8 — live dashboard counts (clickable), `/admin/audit`
  log viewer + activity feed on the dashboard, panel loading/error states.
- **Editorial note:** «Динозавр» magazine == the `Articles` collection (no
  separate table), so `/admin/articles` manages both; `/admin/dino-magazine`
  redirects there. Story submissions are files in the private
  `story-submissions` bucket (no DB table, no status) — the queue is
  list/download/delete; the author name + cover letter are persisted as a
  `{path}.meta.json` sidecar and shown in the list (no email yet — see
  [story-submission-notifications.md](./story-submission-notifications.md)).
  Article `content_blocks` is edited in a **minimal Lexical** rich-text editor
  (paragraphs + inline images via a custom `ImageNode`; serialized back to the
  `paragraph`/`image` block JSON, with orphaned content images cleaned up on
  save) — `src/components/admin/articles/ArticleContentEditor.tsx` + `lexical/`.
- **Box-set image note (resolved):** box-set images now live in the `box-sets`
  Storage bucket (migration `20260604120000_box_sets_bucket.sql`); the editor
  uses the reusable `ImageUploader` (SVG/PNG/JPEG/WEBP). SVGs are fetched and
  inlined server-side on the storefront so they theme/scale.
- **Reusable bits available:** `ImageUploader`, `src/lib/admin/blur.ts`,
  `StatusBadge`, `logAdminAction`, `ProductsManager`/`BookStatusBar` patterns,
  the GET-form list + pagination pattern, `src/lib/admin/bookProducts.ts`
  (client-safe constants pattern — keep server-only imports out of anything a
  client component imports).
- **Scope note:** Title graph now covers awards (attach/detach), per-product
  digital files (upload/remove → digital-files bucket), per-product contributors
  (workers), and the booktrailer (mp4/webm/poster + remove). Still not in the
  editor: book **contexts** (`BookContexts`) and `similar_titles`. Revisit per need.
- **Branch:** work is landing on `update` (the active integration branch).
- **Chrome:** resolved — storefront chrome moved into the `(site)` route group;
  `/admin` has its own header-free chrome. Root layout = html/body/Providers only.
- **Before testing any phase:** seed an admin via the SQL in
  [plan §9](./admin-panel.md#9-provisioning-the-first-admin-sql), then sign out/in.
- **Dev note:** don't run `next build` while `next dev` is running — they share
  `.next` and it wedges the dev server (restart fixes it).

---

## Phase checklist

| # | Phase | Status | Notes / left-off pointer |
|---|-------|--------|--------------------------|
| 0 | Roles & auth foundation | ✅ | `src/lib/admin/auth.ts` (`isAdmin`/`requireAdmin`/`getCurrentUser`); proxy `/admin` gate requires `app_metadata.role==='admin'`, `/admin/login` exempt. Bootstrap SQL in plan §9. |
| 1 | Admin shell + `/admin/login` | ✅ | `(site)` route-group split (storefront chrome moved off root layout); `/admin/login` + `adminLoginAction`/`adminLogoutAction`; guarded `(panel)` layout + `AdminSideNav` + dashboard; section stubs via `ComingSoon`. Heavy primitives (DataTable etc.) deferred to the phase that first needs them. |
| 2 | Orders management | ✅ | Migration `20260603160000` (tracking/carrier/note cols + `AdminAuditLog` + `admin_set_order_fulfillment` RPC) **applied to local DB + types regenerated**. Orders list (`/admin/orders`, filters + pagination), detail (`/admin/orders/[id]`), `setOrderFulfillmentAction`, `FulfillmentForm`, `StatusBadge`, audit timeline. `logAdminAction` helper added for later phases. |
| 3 | Books: list + edit existing | ✅ | `/admin/books` (search + pagination), `/admin/books/[id]` editor: core Title fields + featured/compilation + per-edition price/discount/published/sold_out + cover upload (sharp blur → `Titles.cover_blur`) + **gallery photos manager** (list/upload/remove against `book-photos/{slug}/` + `Titles.book_photos_blurs`). `BookEditForm`, `BookPhotosManager`, `ImageUploader` (reusable), `src/lib/admin/blur.ts`, `updateBookAction`/`uploadBookCoverAction`/`uploadBookPhotoAction`/`deleteBookPhotoAction`. **Verified live** (edit→save→DB+audit; photo upload/delete→bucket+blur map). Create deferred to Phase 4. |
| 4 | Books: full create + lifecycle | ✅ | Editor restructured into **Тайтл** + **Продукты** sections. Products: per-type add/edit/remove (one of each; hard-delete row). Create book (`/admin/books/new` → draft), `BookStatusBar` (publish/archive/draft + hard-delete, blocked while published), status badges + filter on the list. Actions: create/setStatus/delete/addProduct/removeProduct/updateProduct. `Titles.status` migration + storefront RPC filter (committed `14f33eb`). Client-safe `bookProducts.ts` to keep server imports out of the client bundle. **Verified live** end-to-end (create→product→publish→storefront→archive→delete, all audit-logged). Full Title graph (awards/workers/contexts/trailers/digital files) still partial. |
| 5 | Authors & Box Sets | ✅ | **Authors**: `/admin/authors` list+search, create→edit, photo upload (authors bucket + blur), core fields, contacts (channel+url), delete (blocked if linked to titles). **Box Sets**: `/admin/box-sets` list, create→edit (fields + publish/active + image upload), composition manager (`BoxSetBooks` add/remove with optional product_id), delete (cascade). Image upload → `box-sets` bucket via `ImageUploader` (migration `20260604120000`); SVGs inlined on the storefront. **Verified live** both (create→edit→relation→delete; image upload + inline SVG render). |
| 6 | Gift cards, Subscriptions, Promo codes | ✅ | **Gift cards**: `GiftCardProducts` CRUD + image (gift-cards bucket), delete blocked if issued. **Subscriptions**: CRUD + perks (one-per-line → text[]) + image (subscriptions bucket + blur), delete blocked if subscribers. **Promo codes**: create/edit/delete with cart/item target constraint enforced server-side + uppercased codes, computed active flag. **Verified live** (lists render; promo create→uppercase+cart-null constraint→delete). |
| 7 | Editorial (Articles, Dino-magazine, Submissions) | ✅ | **Articles**: `/admin/articles` list + create→edit (title, slug, author, excerpt, published_at, cover upload → articles bucket + blur + dimensions, `content_blocks` via a minimal **Lexical** editor — paragraphs + inline images, orphan-image cleanup on save) + delete. **Dino-magazine** == Articles (no separate table) → `/admin/dino-magazine` redirects to articles; nav consolidated to «Статьи (Динозавр)». **Submissions**: `/admin/submissions` lists the private `story-submissions` bucket (download via signed URL + delete; no DB table/status); author name + cover letter persisted as a `.meta.json` sidecar and shown. **Verified live** (articles create→Lexical save→delete; redirect; submissions show cover letter end-to-end). |
| 8 | Audit surfacing + polish | ✅ | Live dashboard counts (clickable → filtered lists) for orders-to-ship / draft books / submissions, plus a recent-activity feed. `/admin/audit` full log viewer (reads `AdminAuditLog`, resolves actor emails). Panel `loading.tsx` + `error.tsx`. **Verified live** (counts real, feed shows session actions, audit page 13 rows). |

**Featured curation (refinement, post Phase 7):** homepage featured is the
`featured_books` table; removed the dead per-title `is_featured` toggle and added
`/admin/featured` (ordered add/remove/reorder). Nav «На главной». Verified live.

---

## Migrations to create (in order)

| File (proposed) | Phase | Contents | Applied to local? |
|---|---|---|---|
| `20260603160000_order_tracking_and_audit.sql` | 2 | `Orders.tracking_number/tracking_carrier/admin_note`; `AdminAuditLog` table + RLS; `admin_set_order_fulfillment` RPC | ✅ (local; types regenerated) |
| `20260603140000_order_fulfillment_status.sql` | 2 | `Orders` fulfillment status enum/column | ✅ (local) |
| `20260603170000_title_status.sql` | 4 | `Titles.status`; backfill `published`; storefront RPC filters | ✅ (local; types regenerated) |
| `20260604120000_box_sets_bucket.sql` | 5 (refinement) | `box-sets` Storage bucket for box-set images | ✅ (local) |

> After any schema change, regenerate types per AGENTS.md and commit
> `src/types/supabase.ts`.

---

## Per-phase acceptance (Definition of Done)

- **0** Seeded admin passes the `/admin` gate; non-admin bounced to `/admin/login`.
- **1** Admin logs in at `/admin/login`, sees dashboard + nav; non-admin can reach
  nothing but `/admin/login`.
- **2** Logistics marks an order shipped with a tracking number; change appears in
  the audit timeline; storefront order view reflects the new status.
- **3** Editing a book’s fields/price/cover updates the storefront.
- **4** A new book is created as a draft (hidden from storefront) and then
  published (appears). Archiving hides it again. Order-referenced titles never
  hard-delete.
- **5** Author created with photo+blur; box set composed and priced.
- **6** Gift-card product, subscription plan, and promo code each created and
  visible/usable on the storefront.
- **7** Article published; story submission moved through statuses and deletable.
- **8** Audit log viewable; dashboard counts real; lint + build clean.

---

## Conventions reminder (see AGENTS.md + docs/conventions)

- All admin DB access in `src/api/admin/**`; mutations are `requireAdmin()`-gated
  Server Actions writing via `createAdminClient()`.
- SCSS modules + `cn`; Radix primitives; no `any`; pinned deps; `next/image`.
- Commit per phase with a short imperative slug, no AI attribution; push after
  each commit.

---

## Decision log

All scoping decisions captured in [plan §2](./admin-panel.md#2-locked-decisions-from-scoping-qa-2026-06-03).
Changes to scope should be appended here with a date.

- 2026-06-03 — Initial scope locked (single `admin` role, full book CRUD, all
  listed entities, soft-delete/draft, fulfillment+tracking, audit log, no emails).
