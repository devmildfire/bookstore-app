# Checkout Flow — Progress Tracker

**Plan**: [checkout-flow.md](./checkout-flow.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Notes section
at the bottom for blockers.

---

## Steps

- [ ] **1. DB migration: schema + RPCs + bucket**
  File: `supabase/migrations/<ts>_checkout_schema.sql`
  - `BoxSetBooks.product_id TEXT NULL`
  - `Ebooks.file_path`, `Audiobooks.file_path`, `CardBooks.file_path` TEXT NULL
  - `Orders.shipping_*`, `original_total`, `book_discount_total`,
    `promo_code`, `promo_discount`, `paid_at`
  - Storage bucket `digital-files` (private)
  - `box_set_is_physical(integer) → boolean`
  - `place_order(...)` RPC with server-side total recompute + atomic
    Cart/CartPromo wipe
  Apply via psql. Accept: `\d "Orders"` / `\d "BoxSetBooks"` etc. show the
  new columns; `\df` shows the two new functions; `select * from
  storage.buckets where id='digital-files'` returns one row.

- [ ] **2. Regenerate `src/types/supabase.ts`**
  Per `AGENTS.md`. Accept: new columns + RPCs typed; `npm run lint` clean.

- [ ] **3. Entity layer: `src/entities/order/`**
  - `server.ts` — typed rows
  - `client.ts` — `Order`, `OrderItem`, `ShippingAddress`
  - `normalize.ts`
  - `validation.ts` — `shippingSchema`, `emailOnlySchema` (Zod)
  Accept: types compile.

- [ ] **4. API layer: `src/api/orders/`**
  - `getOrders.ts` — list current user's orders with items
  - `placeOrder.ts` — calls `place_order` RPC (returns discriminated union)
  - `getDownloadUrl.ts` — issues a 1 h signed URL for an OrderItem
  - `setRecoveryEmail.ts` — writes to `auth.users.user_metadata.recovery_email`
  - `index.ts` — barrel + query keys
  Accept: each function has explicit types; smoke-tested via dev console.

- [ ] **5. Server Actions: `src/lib/orders/actions.ts`**
  Rewrite. New actions wrapping the API layer:
  - `placeOrderAction(formData)` — calls `placeOrder`, returns
    `{ orderId } | { error }`
  - `getDownloadUrlAction(orderItemId)` — calls `getDownloadUrl`
  - `setRecoveryEmailAction(email)` — calls `setRecoveryEmail`
  Accept: actions are `'use server'`, return typed shapes, throw nothing
  the client can't render.

- [ ] **6. Extend `useCart()` with `hasPhysicalItems`**
  - Add a `useQuery(['cart', 'boxSetPhysical'], …)` that calls
    `box_set_is_physical` for each BoxSet currently in the cart (or one
    RPC that takes an array of box set ids).
  - Compute `hasPhysicalItems` as: any cart item with category in
    {PrintBook, Book2.0}, OR any BoxSet cart item whose physicality flag is
    true.
  - Expose on `useCart()`.
  Accept: cart with only EBook → false; cart with PrintBook → true; cart
  with BoxSet whose contents are mixed → true.

- [ ] **7. `<DeliveryForm />` per Figma**
  `src/components/checkout/DeliveryForm/`
  - React Hook Form + zodResolver(shippingSchema)
  - Two-column grid at desktop/tablet, single column at phone
  - Fields exactly as Figma: Имя и фамилия, Телефон, E-mail (left); Город,
    Улица, Дом+квартира, Почтовый индекс (right). E-mail labeled
    "(необязательно)".
  - "Перейти к оплате" button bottom-right (desktop/tablet) or full-width
    (phone)
  - On submit: emits the validated payload upstream — does not call the
    Server Action itself (the page handles that so it can also open the
    confirm modal).
  Accept: form passes validation when correctly filled; renders at 1920 /
  1024 / 360 matching Figma.

- [ ] **8. `<EmailOnlyForm />`**
  `src/components/checkout/EmailOnlyForm/`
  - Single optional email field + persistent-access hint copy.
  - Same "Перейти к оплате" button.
  Accept: form lets user proceed with an empty email; rejects malformed
  emails.

- [ ] **9. `<PaymentConfirmModal />`**
  `src/components/checkout/PaymentConfirmModal/`
  - Radix Dialog.
  - Body shows: order total recap (К оплате: X₽), name + shipping summary
    (if physical), email (if any).
  - Two buttons: "Подтвердить оплату" (primary), "Отмена" (secondary).
  - On confirm: switches to spinner state ("Обработка платежа..."), awaits
    the Server Action result, redirects on success.
  Accept: modal opens / closes; the in-flight spinner state shows for at
  least 800 ms even if RPC returns instantly (avoid jank); errors render
  inline with a retry option.

- [ ] **10. `/checkout/page.tsx` rewrite**
  - Read `useCart()` → if `items.length === 0`, redirect to `/cart`.
  - Branch on `hasPhysicalItems`: render `<DeliveryForm />` or `<EmailOnlyForm />`.
  - On form submit, capture payload + open `<PaymentConfirmModal />`.
  - Wire confirm → `placeOrderAction` → router.push.
  - Delete the existing 3-step state machine; delete
    `src/app/checkout/success/`, `src/app/checkout/failure/`.
  Accept: full flow works from /cart → /checkout → modal → /account for
  both physical and digital carts. Empty cart on /checkout → redirect.

- [ ] **11. `<AnonRecoveryModal />` + `<AnonRecoveryBanner />`**
  `src/components/account/AnonRecoveryModal/`,
  `src/components/account/AnonRecoveryBanner/`
  - Modal: copy from the plan, two CTAs ("Оставить email" / "Я в курсе").
    Clicking "Оставить email" reveals an inline email input → calls
    `setRecoveryEmailAction`. Modal closes on either CTA.
  - Banner: small persistent strip at top of /account for anon users; CTA
    "Привязать email →" opens the same modal.
  Accept: copy matches plan; "Оставить email" successfully writes
  `recovery_email` to `user_metadata`.

- [ ] **12. `<OrdersList />` for `/account`**
  `src/components/account/OrdersList/`
  - Fetches `getOrders` for the current user.
  - One card per order: order id, date, total, applied promo (if any),
    list of items.
  - Per-item rendering:
    - EBook / AudioBook / Book2.0 → "Скачать" button → calls
      `getDownloadUrlAction` → `window.open(url)`. Re-click = regenerate.
    - PrintBook → status "Ожидает отправки" (or `Status` field if we add
      one).
    - BoxSet / GiftCard / Subscription / Course → "Ждёт ручной обработки".
  Accept: a placed order from step 10 shows up immediately; download
  button issues a working 1 h signed URL for an EBook with `file_path` set
  (test by uploading one file manually before this step).

- [ ] **13. `/account/page.tsx` allow anon**
  - Remove `if (user.is_anonymous) redirect('/auth/login')`. Keep
    `if (!user) redirect('/auth/login')`.
  - Render `<OrdersList />` + `<AnonRecoveryBanner />` (if anon).
  - If `searchParams.from === 'checkout'` AND `user.is_anonymous` → mount
    `<AnonRecoveryModal />` open by default.
  - Real user: still see profile email + logout (unchanged), plus
    `<OrdersList />`.
  Accept: real user sees orders + profile; anon user sees orders + banner;
  post-checkout anon sees the modal exactly once per redirect.

- [ ] **14. Seed one digital file for manual testing**
  Upload e.g. a small placeholder PDF to `digital-files/ebooks/50.pdf`
  via Supabase Studio. Set `Ebooks.file_path = 'ebooks/50.pdf'` for ebook
  id 50 (Белый цветок). This lets step 12's "Скачать" button actually
  return a working signed URL during visual verification.
  Accept: signed URL returns the placeholder file in a browser.

- [ ] **15. Visual verification**
  - Cart with one ebook (Белый цветок) → /checkout shows email-only form →
    leave email blank → modal → confirm → /account → no shipping fields on
    the order card → "Скачать" button works.
  - Same flow but enter email → order has `delivery_email` populated.
  - Cart with one printed book → /checkout shows delivery form → fill all
    fields → confirm → /account → order card shows shipping address.
  - Mix of ebook + printed book → delivery form (physical wins).
  - BoxSet only, with all-digital `BoxSetBooks` entries → email-only form.
  - BoxSet only, with one `PrintBook-N` entry → delivery form.
  - Apply `WHITE30` then checkout an ebook of Белый цветок → Order row has
    `promo_code='WHITE30'`, `promo_discount > 0`, `total < original_total`.
  - Cart + CartPromo wiped after order. Returning to /cart shows empty
    state.
  - Anon user after checkout → modal pops with the snarky copy. "Я в
    курсе" closes it; "Оставить email" → inline input → submit →
    `recovery_email` saved.
  - Real user after checkout → no modal, no banner.
  - Field validation: empty postal code, invalid phone, malformed email →
    inline error, form does not submit.
  - All three breakpoints (1920, 1024, 360) match Figma.

- [ ] **16. Lint, commit, push**
  `npm run lint`. Check diff for secrets / >1 MB. One commit (or split into
  schema + UI). Push immediately.

---

## Notes / blockers

_(append entries as you work — date, what happened, what's needed to unblock)_
