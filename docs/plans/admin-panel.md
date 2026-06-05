# Admin Panel — Implementation Plan

Status: **shipped** (all phases). Kept as the admin design + provisioning
reference (see §9 for seeding the first admin — `src/lib/admin/auth.ts` points
here). The phase-by-phase build tracker was removed once complete; see git
history for it. Created: 2026-06-03.

A back-office for staff to manage everything sellable and editorial on the site:
add/edit/remove books and related products, and let the logistics team track
orders and advance their fulfillment when physical/non-digital items ship.

---

## 1. Goals

- A staff-only interface at **`/admin`**, reachable only by users with the
  **`admin`** role, who sign in with **email + password only** (no Google/OAuth,
  no anonymous sessions).
- **Orders**: view/filter all orders, advance fulfillment status, record
  tracking/carrier/notes when shipping physical items. (Primary logistics need.)
- **Books**: full lifecycle — create, edit, and archive a Title and its entire
  graph (editions, authors, awards, contexts, trailers, photo galleries),
  including image uploads with blur generation and a draft/publish workflow.
- **Other catalog**: Authors, Box Sets, Gift-card products, Subscriptions,
  Promo codes.
- **Editorial**: Articles, Dino-magazine, and a Story-submission review queue.
- **Accountability**: an audit log of order transitions and destructive actions.

## 2. Locked decisions (from scoping Q&A, 2026-06-03)

| Topic | Decision |
|---|---|
| Role storage | Single `admin` role in `auth.users.app_metadata.role`; rides in JWT. |
| Provisioning | SQL snippet only (no in-app user-management screen). |
| Admin login | Dedicated `/admin/login`, email+password only; verify role post-login. |
| Write authorization | Gated Server Actions verify JWT role, then write via `createAdminClient()` (service-role). Owner-only RLS stays as-is. |
| Delete model | Soft-delete + draft/published/archived. Nothing order-referenced is hard-deleted. |
| Catalog visibility | Storefront shows only `published`. Existing rows backfilled `published`. |
| Orders | Fulfillment transitions + tracking number/carrier/note. Read-only on price & payment status. |
| Notifications | Out of scope (SMTP stubbed). Leave a clearly-marked hook. |
| Images | Generate blur (`sharp`) server-side on upload; write to the `*_blur` columns. |
| Audit | `AdminAuditLog` table for order transitions + destructive actions; timeline on order detail. |
| UI | `/admin` route group, own chrome (top bar + sidebar, no storefront header/footer), storefront dark tokens, Radix + SCSS modules. |
| Featured books | Managed from Books admin (drives `Titles.is_featured` / `featured_books`). |
| Story submissions | View + change status + delete. |

## 3. Non-goals (this effort)

- Customer email/SMS notifications (status changes are DB-only; hook left behind).
- In-app granting/revoking of admin (done via SQL).
- Per-section RBAC / a separate `logistics` role (single `admin` only; role model
  is designed so more roles can be added later without rework).
- Refunds, payment-status overrides, editing order prices/line items (the
  `Orders` price snapshot is immutable per AGENTS.md).
- Real PSP/financial reconciliation.

---

## 4. Architecture

### 4.1 Roles & authentication

- Role lives in `auth.users.raw_app_meta_data->>'role'`. Set via service-role
  SQL (see §9). `app_metadata` is not user-editable and is embedded in the JWT,
  so the proxy and server can read it without a DB round-trip.
- A tiny helper resolves the current user's admin status from the server client:
  `src/lib/admin/auth.ts → isAdmin(user)` / `requireAdmin()` (throws/redirects).
- **`src/proxy.ts`** already lists `/admin` in `PROTECTED_PREFIXES` but only
  checks "is there a user". Extend the `/admin` branch to also require
  `app_metadata.role === 'admin'`; non-admins are redirected to `/admin/login`
  (not the storefront login). `/admin/login` itself must be exempt from the gate.
- **`/admin/login`**: email+password form → `adminLoginAction`:
  `signInWithPassword`, then re-read the user; if not admin → `signOut()` and
  return an error; if admin → redirect to `/admin`. No anon-migration, no OAuth.
- Side note: the storefront `loginAction` now redirects to `/profile` (it used
  to point at the dead `/account` route — fixed 2026-06-05).

### 4.2 Authorization / write path

- Every admin mutation is a Server Action in `src/lib/admin/<domain>/actions.ts`
  (or `src/api/admin/<domain>/`), shaped as:
  1. `requireAdmin()` — verify caller's JWT role server-side (throws on failure).
  2. Validate input with a Zod schema (`src/entities/<domain>/validation.ts`).
  3. Write via `createAdminClient()` (service-role) — bypasses owner-only RLS.
  4. `revalidatePath()` / return a typed result `{ status: 'ok' | 'error' }`.
- Reads for admin lists can use the server client where RLS allows, or the
  service-role client for cross-user data (e.g. all orders). Keep all DB access
  in `src/api/admin/**` per the project's "no Supabase in components" rule.

### 4.3 Route group & layout

```
src/app/admin/
  login/page.tsx              # public (gate-exempt) email+password form
  layout.tsx                  # admin chrome: top bar + AdminSideNav; server-side requireAdmin guard
  page.tsx                    # dashboard (counts: pending-fulfillment orders, drafts, new submissions)
  orders/  (list, [id])
  books/   (list, new, [id]/edit)
  authors/ box-sets/ gift-cards/ subscriptions/ promo-codes/
  articles/ dino-magazine/ submissions/
  error.tsx  loading.tsx  not-found.tsx
src/components/admin/**        # AdminSideNav, DataTable, FormField, ImageUploader, StatusBadge, ConfirmDialog, AuditTimeline
src/lib/admin/**               # auth.ts (isAdmin/requireAdmin), blur.ts (sharp), audit.ts (log helper)
src/api/admin/**               # per-domain read/write modules (service-role)
```

- Layout is a Server Component that calls `requireAdmin()` (defense in depth with
  the proxy) and renders the admin chrome. Reuse `$color-*` tokens, `cn`,
  SCSS modules, Radix Dialog/Select/Popover. Build a generic `DataTable`
  (search + filter + sort + pagination) reused across all list screens.

### 4.4 Data-model changes (new migrations)

1. **Publish/lifecycle status.** Add a `status` (`'draft' | 'published' | 'archived'`,
   default `'published'`) to `Titles` and to other independently-sellable products
   (`Subscriptions`, `GiftCardProducts`, `BoxSets`). Backfill existing rows to
   `'published'`. Per-edition `is_published`/`sold_out` already exist on
   edition tables (e.g. `CardBooks`) — keep using them for per-edition control;
   `Titles.status` governs whether the title appears at all.
2. **Order fulfillment extras.** `Orders.fulfillment_status` already exists
   (migration `20260603140000`). Add `tracking_number TEXT`, `tracking_carrier TEXT`,
   `admin_note TEXT` to `Orders`.
3. **Audit log.** New `AdminAuditLog` table: `id, actor_user_id, action TEXT,
   entity_type TEXT, entity_id TEXT, summary TEXT, metadata JSONB, created_at`.
   RLS: admins read; writes only via service-role helper `logAdminAction()`.
4. **Storefront filter.** Update public read paths/RPCs (`getBooks`, `getBook`,
   `searchBooks`, `search_books` RPC, featured, sitemap/metadata) to filter
   `Titles.status = 'published'`. Backfill makes this a no-op for current data.

### 4.5 Image upload + blur

- Reuse `scripts/_blur.mjs` logic (`sharp`, resize 10×15, JPEG q40, base64) in a
  server helper `src/lib/admin/blur.ts`. On upload, the action: validates
  mime/size → uploads object to the target bucket via service-role storage →
  generates the blur data URL → writes the bare object key + blur to the row’s
  `*_blur` column. Covers buckets: `covers` (`Titles.cover_blur`), `authors`
  (`Authors.photo_blur`), `book-photos` (`Titles.book_photos_blurs` JSONB),
  `subscriptions` (`Subscriptions.image_blur`), gift-card & article cover buckets.
- Keep the existing `scripts/sync-*-blurs.mjs` as a fallback/backfill tool.

---

## 5. Build phases

Each phase is a self-contained, shippable unit (all now shipped). Order was
chosen so the highest-value, lowest-risk pieces (auth + orders) land first.

- **Phase 0 — Roles & auth foundation.** `isAdmin`/`requireAdmin` helpers;
  extend proxy `/admin` gate to require the role; SQL bootstrap doc (§9);
  `auth.users` app_metadata convention. Acceptance: a seeded admin can pass the
  gate; a normal user is bounced to `/admin/login`.
- **Phase 1 — Admin shell + login.** `/admin/login` + `adminLoginAction`;
  `/admin/layout.tsx` guard + chrome; `AdminSideNav`; dashboard skeleton;
  generic `DataTable`, `StatusBadge`, `ConfirmDialog`, `FormField`,
  `ImageUploader` primitives. Acceptance: admin logs in, sees an empty dashboard
  and nav; non-admin can’t reach anything but `/admin/login`.
- **Phase 2 — Orders management.** Migration: tracking + note columns +
  `AdminAuditLog`. Orders list (filter by fulfillment/payment/date/search),
  order detail with line items + shipping, fulfillment-advance action with
  tracking inputs, audit timeline. Acceptance: logistics can mark an order
  shipped with a tracking number and see the change logged.
- **Phase 3 — Books: list + edit existing.** Books list (status/author/search),
  edit core Title fields (name, slug, description, thesis, age, lit_form,
  featured) + per-edition price/discount/sold_out/is_published + cover upload
  with blur. Acceptance: editing a book updates the storefront.
- **Phase 4 — Books: full create + lifecycle.** Migration: `Titles.status`
  (+ other products) + storefront `published` filter + backfill. Create-Title
  flow across the full graph (authors link, awards, editions incl.
  Ebooks/Audiobooks/CardBooks/PrintedBooks + digital file upload to
  `digital-files`, workers, contexts, trailers, photo galleries). Draft → publish
  → archive. Acceptance: a brand-new book can be created as a draft and published.
- **Phase 5 — Authors & Box Sets.** Author CRUD (+ photo upload/blur, contacts);
  Box-set composition editor (`BoxSetBooks`), pricing, image, physicality.
- **Phase 6 — Gift cards, Subscriptions, Promo codes.** CRUD for
  `GiftCardProducts`, `Subscriptions` (plan fields + image), `PromoCodes`
  (cart/item kinds, target validation, window, %; respects the constraints in
  AGENTS.md “Promo codes”).
- **Phase 7 — Editorial.** Articles CRUD (+ cover upload/dimensions);
  Dino-magazine management; Story-submission review queue (view + status +
  delete).
- **Phase 8 — Audit surfacing + polish.** Audit-log viewer, dashboard counts
  wired to real data, empty/loading/error states, a11y pass, responsive checks.

---

## 6. Storefront impacts to watch

- Adding `Titles.status` and filtering to `published` touches **every public
  book read path** (`src/api/books/*`, `search_books` RPC, featured, similar
  titles, sitemap, `generateMetadata`). Backfill all existing rows to
  `published` in the same migration so nothing disappears.
- Box sets / subscriptions / gift cards gain the same `status` gate on their
  public surfaces.
- Archived/draft items must 404 (or hide) on the storefront but remain reachable
  in admin.

## 7. Security checklist

- `requireAdmin()` enforced in **both** the proxy and every admin Server Action
  and the `/admin` layout (defense in depth).
- Service-role key (`SUPABASE_SERVICE_ROLE_KEY`) used only in server code; never
  imported into a client component.
- Zod-validate every admin input; never trust client-sent ids/roles.
- `/admin/login` rejects non-admins (sign out immediately), no user enumeration
  in error copy.
- Storage uploads: enforce mime allow-list + size cap server-side before writing.

## 8. Open questions / deferred

- Pagination strategy for very large order lists (offset vs keyset) — decide in
  Phase 2; start with offset + total count.
- Whether `logistics` becomes a real role later (role model leaves room).
- Notification hook implementation when SMTP lands.

## 9. Provisioning the first admin (SQL)

Run against the DB (service-role / direct psql). Replace the email.

```sql
-- Grant admin
update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
       || jsonb_build_object('role', 'admin')
 where email = 'admin@example.com';

-- Revoke admin
update auth.users
   set raw_app_meta_data = raw_app_meta_data - 'role'
 where email = 'admin@example.com';
```

The user must sign out / back in for the new JWT to carry the role.
```
```
