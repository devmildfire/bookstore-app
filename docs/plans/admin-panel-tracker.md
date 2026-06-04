# Admin Panel — Progress Tracker

Living checklist for the [admin-panel plan](./admin-panel.md). Update this file
as work proceeds so an interrupted session can resume without re-deriving state.

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked

---

## ▶️ Resume here

- **Current phase:** Phase 7 (Editorial: Articles, Dino-magazine, Story submissions).
- **Next action:** Articles CRUD (+ cover upload/dimensions), Dino-magazine
  management, and a Story-submission review queue (view + status + delete).
  Follow the list/create/[id] + manager patterns from Phases 4–6.
- **Box-set image note:** box-set images are static files under `public/boxsets/`
  (not a storage bucket), so the editor exposes the image as a filename field,
  not an uploader. Real upload would need a `box-sets` bucket migration.
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
| 5 | Authors & Box Sets | ✅ | **Authors**: `/admin/authors` list+search, create→edit, photo upload (authors bucket + blur), core fields, contacts (channel+url), delete (blocked if linked to titles). **Box Sets**: `/admin/box-sets` list, create→edit (fields + publish/active + image filename), composition manager (`BoxSetBooks` add/remove with optional product_id), delete (cascade). Image is a filename field — box-set images are static `/boxsets/` files, not a bucket. **Verified live** both (create→edit→relation→delete). |
| 6 | Gift cards, Subscriptions, Promo codes | ✅ | **Gift cards**: `GiftCardProducts` CRUD + image (gift-cards bucket), delete blocked if issued. **Subscriptions**: CRUD + perks (one-per-line → text[]) + image (subscriptions bucket + blur), delete blocked if subscribers. **Promo codes**: create/edit/delete with cart/item target constraint enforced server-side + uppercased codes, computed active flag. **Verified live** (lists render; promo create→uppercase+cart-null constraint→delete). |
| 7 | Editorial (Articles, Dino-magazine, Submissions) | ⬜ | content CRUD; submission review (view/status/delete) |
| 8 | Audit surfacing + polish | ⬜ | audit viewer, dashboard counts, a11y/responsive |

---

## Migrations to create (in order)

| File (proposed) | Phase | Contents | Applied to local? |
|---|---|---|---|
| `20260603160000_order_tracking_and_audit.sql` | 2 | `Orders.tracking_number/tracking_carrier/admin_note`; `AdminAuditLog` table + RLS; `admin_set_order_fulfillment` RPC | ✅ (local; types regenerated) |
| `..._title_publish_status.sql` | 4 | `Titles.status` (+ BoxSets/Subscriptions/GiftCardProducts); backfill `published`; storefront RPC filters | ⬜ |

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
