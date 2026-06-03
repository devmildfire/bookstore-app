# Admin Panel — Progress Tracker

Living checklist for the [admin-panel plan](./admin-panel.md). Update this file
as work proceeds so an interrupted session can resume without re-deriving state.

**Status legend:** ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked

---

## ▶️ Resume here

- **Current phase:** Phase 2 (Orders management).
- **Next action:** create the migration (`Orders.tracking_number/tracking_carrier/
  admin_note` + `AdminAuditLog` table + RLS), then build the orders list
  (filters), order detail, the fulfillment-advance Server Action with tracking
  inputs, and the audit timeline. Reads of all orders use `createAdminClient()`
  in `src/api/admin/orders/`.
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
| 2 | Orders management | ⬜ | migration (tracking/note cols + AdminAuditLog), list+detail, fulfillment action, audit timeline |
| 3 | Books: list + edit existing | ⬜ | edit Title core + per-edition price/stock + cover upload/blur |
| 4 | Books: full create + lifecycle | ⬜ | migration (`Titles.status` + storefront filter + backfill), full create graph, draft/publish/archive |
| 5 | Authors & Box Sets | ⬜ | author CRUD + photo/blur; box-set composition |
| 6 | Gift cards, Subscriptions, Promo codes | ⬜ | product CRUD; promo constraints per AGENTS.md |
| 7 | Editorial (Articles, Dino-magazine, Submissions) | ⬜ | content CRUD; submission review (view/status/delete) |
| 8 | Audit surfacing + polish | ⬜ | audit viewer, dashboard counts, a11y/responsive |

---

## Migrations to create (in order)

| File (proposed) | Phase | Contents | Applied to local? |
|---|---|---|---|
| `..._order_tracking_and_audit.sql` | 2 | `Orders.tracking_number/tracking_carrier/admin_note`; `AdminAuditLog` table + RLS | ⬜ |
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
