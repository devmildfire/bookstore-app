# Checkout Flow

**Status**: Pending
**Branch**: update
**Tracker**: [checkout-flow-tracker.md](./checkout-flow-tracker.md)

---

## Goal

Single-page checkout (SPC) for the cart.

- **Cart has physical items** → show delivery address form (per the Figma
  desktop / tablet / mobile frames).
- **Cart has only digital items** → show a single optional email field with a
  hint about persistent access.

After form submit → confirmation modal with a fake "Confirm Payment" button →
~3 s "processing" state → atomic order creation in the DB + cart wipe →
redirect to `/account`.

Anonymous users land on `/account` and see a snarky-but-accommodating modal
explaining the 30-day cookie tether. Modal fires on **every** purchase
redirect (every order, every time), driven by a `?from=checkout&order=<id>`
query param.

---

## Confirmed behavior (locked via Q&A)

| Decision | Answer |
|---|---|
| What categories require delivery | `PrintBook`, `Book2.0`, and `BoxSet` whose contents include any `PrintBook`/`Book2.0` product. |
| BoxSet content representation | `BoxSetBooks.product_id TEXT NULL` — `NULL` means "all editions of this title", a value like `PrintBook-12` means a specific edition. |
| BoxSet physicality detection | Parse `BoxSetBooks`: physical if any entry's `product_id` starts with `PrintBook-`/`Book2.0-`, OR (for title-only entries) the title has a row in `PrintedBooks` or `CardBooks`. |
| Digital file storage | New `file_path TEXT` columns on `Ebooks`, `Audiobooks`, `CardBooks`. New private Supabase Storage bucket `digital-files`. Signed URLs with 1 h TTL. Admin uploads come later. |
| Email sending | Stubbed this PR. Order captures `delivery_email`. Real SMTP is a separate task. |
| Email association | Stored on `Orders.delivery_email` only. `auth.users` is not modified. When real registration lands, that flow can link orders by email. |
| Email field requirement | **Optional in both flows.** Validated as email format if non-empty. |
| Payment UX | Modal with a fake "Подтвердить оплату" button. Click → spinner state "Обработка платежа..." → ~3 s → order created → redirect. |
| Post-payment redirect | `/account?from=checkout&order=<id>`. Modal fires whenever both params present and `user.is_anonymous`. |
| Modal frequency | Every anonymous purchase triggers it. Real users never see it. |
| Anon access to `/account` | Allowed. Show orders + downloads + a persistent "Сохранить доступ" banner. Real users see the same plus profile/email/logout. |
| Cart cleanup | `Cart` and `CartPromo` rows are wiped inside the same transaction that inserts `Orders`/`OrderItems`. |
| Promo snapshot on order | Order captures `promo_code`, `promo_discount`, `original_total`, `book_discount_total`, `final_total`. Order is immutable. |
| Existing `/checkout` page | Rewrite. The current scaffold (3-step review/payment/processing with `delivery_method='download'/'email'`) doesn't match the new spec. |
| Cart summary on `/checkout` | None. Matches the Figma frames. Totals reappear inside the payment confirmation modal so the user re-sees the amount before clicking "Подтвердить". |
| Out of scope | Real email sending; real PSP integration; BoxSet/GiftCard/Subscription/Course file downloads (the OrderItem shows "Ждёт ручной обработки" placeholder); admin panel for file uploads. |

---

## Schema changes

### 1. `BoxSetBooks` — concrete-edition support

```sql
ALTER TABLE "BoxSetBooks"
  ADD COLUMN IF NOT EXISTS product_id TEXT NULL;

-- Optional self-doc constraint (not enforced server-side beyond format):
-- product_id format mirrors Cart.id: '<Category>-<edition_id>'.
```

### 2. Digital file paths

```sql
ALTER TABLE "Ebooks"     ADD COLUMN IF NOT EXISTS file_path TEXT NULL;
ALTER TABLE "Audiobooks" ADD COLUMN IF NOT EXISTS file_path TEXT NULL;
ALTER TABLE "CardBooks"  ADD COLUMN IF NOT EXISTS file_path TEXT NULL;
```

Files live in a private bucket `digital-files`. Paths look like
`ebooks/{edition_id}.epub`, `audiobooks/{edition_id}.mp3`, etc. The actual
filename is admin-controlled; the column just stores the object key.

### 3. `Orders` — shipping address + price snapshot

```sql
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS shipping_name        TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_phone       TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_city        TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_street      TEXT NULL,
  ADD COLUMN IF NOT EXISTS shipping_building    TEXT NULL,  -- "Дом, квартира"
  ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT NULL,
  ADD COLUMN IF NOT EXISTS original_total       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS book_discount_total  NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS promo_code           TEXT NULL,
  ADD COLUMN IF NOT EXISTS promo_discount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS paid_at              TIMESTAMPTZ NULL;

-- `total` (existing) becomes the final_total — what user paid.
```

Existing `delivery_method` / `delivery_email` are reused. `delivery_method`
takes a new value `shipping` for physical orders.

### 4. Private storage bucket

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('digital-files', 'digital-files', false)
ON CONFLICT (id) DO NOTHING;

-- No public read. Only the place_order/regenerate_download Server Actions
-- (running as the user) issue signed URLs, which expire after 1 h.
```

### 5. RPC: `place_order`

Atomic: validates cart + promo server-side, creates Order/OrderItems,
clears Cart/CartPromo.

```sql
CREATE OR REPLACE FUNCTION place_order(
  p_shipping_name        TEXT,
  p_shipping_phone       TEXT,
  p_shipping_city        TEXT,
  p_shipping_street      TEXT,
  p_shipping_building    TEXT,
  p_shipping_postal_code TEXT,
  p_email                TEXT
) RETURNS jsonb
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
-- Steps:
-- 1. Read auth.uid(); return { error: 'not_authenticated' } if null.
-- 2. Read Cart rows (RLS scopes to user). If empty: { error: 'empty_cart' }.
-- 3. Read CartPromo + PromoCodes (RLS).
-- 4. Recompute the same totals as src/lib/cartTotals.ts (max-wins). NEVER
--    trust client-side numbers.
-- 5. Re-validate the promo's date window.
-- 6. INSERT Orders with all snapshot fields + delivery_method:
--      'shipping' if any shipping field is provided, else 'email' or 'download'.
-- 7. INSERT OrderItems from Cart rows.
-- 8. DELETE FROM CartPromo WHERE user_id = auth.uid();
-- 9. DELETE FROM Cart      WHERE user_id = auth.uid();
-- 10. Return { ok, orderId }.
```

### 6. RPC: `get_box_set_physical_flag`

```sql
CREATE OR REPLACE FUNCTION box_set_is_physical(p_box_set_id INTEGER)
RETURNS BOOLEAN
-- True if any BoxSetBooks row for this box set:
--   - has product_id starting with 'PrintBook-' or 'Book2.0-', OR
--   - has product_id NULL (whole-title) AND that title has a PrintedBooks
--     or CardBooks row.
```

Used at cart load time to flag BoxSets as physical or all-digital.

---

## Architecture

### Cart-level physicality detection

Browser-side: extend `useCart()` with a derived `hasPhysicalItems: boolean`.
Computation uses a new query that returns the physical flag per BoxSet in
the cart (`box_set_is_physical` joined to Cart rows where category =
'BoxSet'). For non-BoxSet categories the check is local (just look at
`item.category`).

### `/checkout` page

`src/app/checkout/page.tsx` — Client Component (form + modal state).

```
useCart() → hasPhysicalItems
  ├── true  → <DeliveryForm />     // address + optional email
  └── false → <EmailOnlyForm />    // single optional email + persistent-access hint
```

Both forms submit to the same Server Action `placeOrderAction(formData)`
which calls the `place_order` RPC.

On the SPC, after submit:

1. Render `<PaymentConfirmModal />` with the recomputed total from `useCart`
   (`finalTotal`).
2. User clicks "Подтвердить оплату".
3. Modal switches to spinner state "Обработка платежа...".
4. After ~3 s (`setTimeout`), the Server Action actually runs (we don't
   await it for the full 3 s — start the call when the user clicks, show
   the spinner, but wait for the RPC to return before redirecting).
5. On success: `router.push('/account?from=checkout&order=' + orderId)`.
6. On error: modal shows error message + "Закрыть" button.

### `/account` page

Currently redirects anon users to `/auth/login`. Remove that guard.

```
src/app/account/page.tsx
  ├── if !user → redirect /auth/login   (still required: must have *some* user)
  ├── render <OrdersList />
  ├── if user.is_anonymous → <AnonRecoveryBanner /> at top
  └── if user.is_anonymous && searchParams.from === 'checkout'
       → <AnonRecoveryModal /> mounts open
```

`OrdersList` fetches the user's orders + items. Each digital item gets a
"Скачать" button → calls a Server Action `getDownloadUrlAction(orderItemId)`
which:
1. Verifies the OrderItem belongs to the calling user.
2. Looks up the edition's `file_path`.
3. Calls `supabase.storage.from('digital-files').createSignedUrl(file_path, 3600)`.
4. Returns the signed URL.

The user clicks the button → fetches the URL → `window.open(url)`. Re-clicking
the button is the "regenerate" mechanism (issues a fresh 1 h URL each call).

For physical-only items: no download button; status text "В обработке".

---

## Modal copy (draft — please review)

Title: **«Между нами говоря…»**

Body:
> У вас на руках заказ под анонимным аккаунтом. Это нормально — сайт ваш,
> правила ваши, мы здесь просто помогаем читать.
>
> Одна штука: ваш доступ к скачиванию живёт в куках этого браузера. Если
> вы очистите куки, зайдёте с другого устройства, или просто не заглянете
> к нам в течение 30 дней — доступ к покупкам пропадёт. Файлы у нас
> останутся. А способа доказать, что они ваши, у вас уже не будет.
>
> Если эти книги вам читать здесь и сейчас — никаких действий не нужно,
> всё работает.
>
> Если хочется иметь возможность вернуться когда-нибудь — оставьте email.
> Это бесплатно, ни к чему не обязывает, и обещаем не спамить.

Buttons:
- **«Оставить email»** — primary (focuses a small inline email input that
  posts to `setRecoveryEmailAction(email)` — for now just records the email
  on `auth.users.user_metadata` for future registration to find).
- **«Я в курсе, спасибо»** — secondary (close modal).

Banner copy (always-visible at top of `/account` for anon users, after
modal dismissal):
> Доступ к покупкам сохранён в куках этого браузера. **Привязать email →**

---

## Validation rules

```ts
// src/entities/order/validation.ts
const phoneRegex = /^[+()\d\s-]{10,20}$/
const postalCodeRegex = /^\d{6}$/   // Russian Post 6-digit

const shippingSchema = z.object({
  name:        z.string().trim().min(2, 'Введите имя и фамилию').max(100),
  phone:       z.string().trim().regex(phoneRegex, 'Введите корректный телефон'),
  email:       z.string().trim().email('Введите корректный email').optional().or(z.literal('')),
  city:        z.string().trim().min(2, 'Введите город').max(100),
  street:      z.string().trim().min(2, 'Введите улицу').max(200),
  building:    z.string().trim().min(1, 'Введите дом / квартиру').max(50),
  postalCode:  z.string().trim().regex(postalCodeRegex, 'Введите 6-значный индекс'),
})

const emailOnlySchema = z.object({
  email: z.string().trim().email('Введите корректный email').optional().or(z.literal('')),
})
```

React Hook Form + zodResolver in the form components.

---

## File touches

| File | Change |
|---|---|
| `supabase/migrations/<ts>_checkout_schema.sql` | All schema changes + RPCs + storage bucket. |
| `src/types/supabase.ts` | Regenerated. |
| `src/entities/order/{server,client,normalize,validation}.ts` | New. |
| `src/api/orders/{getOrders,getDownloadUrl,placeOrder,setRecoveryEmail}.ts` | New API/action layer. |
| `src/contexts/cart.tsx` | Add `hasPhysicalItems` derived flag + `boxSetPhysicalFlags` query. |
| `src/lib/orders/actions.ts` | Rewrite. New Server Actions: `placeOrderAction`, `getDownloadUrlAction`, `setRecoveryEmailAction`. |
| `src/app/checkout/page.tsx` + `.module.scss` | Rewrite per Figma. |
| `src/app/checkout/success/`, `src/app/checkout/failure/` | Delete (no longer needed — redirect is direct to /account). |
| `src/components/checkout/DeliveryForm/` | New: Figma fields, two-column grid (desktop/tablet), single column (phone). |
| `src/components/checkout/EmailOnlyForm/` | New: single email field + persistent-access hint copy. |
| `src/components/checkout/PaymentConfirmModal/` | New: confirmation modal w/ totals + Confirm/Cancel + spinner state. |
| `src/app/account/page.tsx` + `.module.scss` | Allow anon; render `<OrdersList />` + (anon-only) banner + (post-checkout) modal. |
| `src/components/account/OrdersList/` | New: lists orders, each with items, status, download buttons. |
| `src/components/account/AnonRecoveryBanner/` | New: top-of-page banner for anon users. |
| `src/components/account/AnonRecoveryModal/` | New: the snarky modal with email input + close. |

---

## Acceptance

- Cart of just digital items → `/checkout` shows only the email field +
  persistent-access hint.
- Cart with a print book → `/checkout` shows the full delivery form per Figma
  at 1920 / 1024 / 360 widths.
- Cart with a BoxSet whose `BoxSetBooks` includes a `PrintBook-N` entry →
  delivery form. Same BoxSet but only ebook entries → email-only form.
- Submitting valid form → `<PaymentConfirmModal />` shows total. Clicking
  "Подтвердить оплату" → spinner → Order row created → `Cart` + `CartPromo`
  for this user are gone → redirect to `/account?from=checkout&order=<id>`.
- The Order row has all snapshot fields populated: original_total,
  book_discount_total, promo_code (or NULL), promo_discount (or 0),
  total (= final_total), shipping_* (NULL for email-only).
- Anon user lands on `/account?from=checkout&order=<id>` → modal pops with
  the snarky copy. Real user — no modal.
- Anon user clicks "Оставить email" inside the modal → email saved on
  `auth.users.user_metadata.recovery_email`. (Registration flow can use
  this later.)
- `/account` lists the new order at the top. Each EBook / AudioBook /
  Book2.0 item has a "Скачать" button. Clicking it issues a 1 h signed URL
  and opens it. Clicking again issues a fresh URL (= regenerate).
- PrintBook items: no download, status "Ожидает отправки".
- BoxSet / GiftCard / Subscription / Course items: status
  "Ждёт ручной обработки" — no download buttons (out of scope).
- Server-side validation: client cannot bypass — `place_order` recomputes
  totals from DB Cart, validates the promo independently. RLS prevents
  inserting orders for someone else.
- `npm run lint` clean.

---

## Out of scope

- Real payment gateway integration (PSP).
- Real transactional email (Resend/Postmark/etc.) — current PR only stores
  `delivery_email`; no email is sent.
- Admin panel for uploading digital files / setting `file_path` /
  configuring BoxSet contents.
- Registration / OAuth / magic links — referenced in modal copy but the
  actual flow is a separate task.
- BoxSet / GiftCard / Subscription / Course download fulfillment — the
  cabinet shows a placeholder status.
- Order detail page (`/orders/[id]`) — cabinet lists everything inline.
- Order cancellation, refunds, status updates beyond `paid`.
- Shipping cost calculation, tax, delivery method selection.
