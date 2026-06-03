# Plan: Robokassa payment integration (with swappable mock gateway)

## Goal

Replace the current fake "confirm payment → 1.5 s delay → order created as paid"
checkout with a **Robokassa-shaped payment pipeline**. Our own module speaks the
exact Robokassa protocol — same request params, same signature scheme, same
ResultURL / SuccessURL / FailURL contracts — but ships with a **local stand-in
gateway** that behaves like the real Robokassa hosted payment page. Going live is
a **credentials + provider-flag swap**: every ResultURL / Success / Fail handler
and every signature stays byte-for-byte identical.

## The Robokassa contract we mirror (verified against official docs)

- **Initiate** — redirect buyer (GET/POST) to `https://auth.robokassa.ru/Merchant/Index.aspx`
  with `MerchantLogin`, `OutSum` (`990.00`), `InvId` (our integer order id),
  `Description`, `SignatureValue`, optional `Receipt`, `Email`, `Culture`,
  `IsTest`, `Recurring`, `Shp_*`.
  `SignatureValue = MD5(MerchantLogin:OutSum:InvId:Password1)`; `Receipt` inserted
  before the password when present; `Shp_*` appended **sorted alphabetically** as
  `:Shp_key=value`.
- **ResultURL** (server→server webhook, source of truth) — Robokassa sends
  `OutSum`, `InvId`, `SignatureValue = MD5(OutSum:InvId:Password2)` (+`Shp_*`).
  We verify, mark paid, reply with the literal **`OK{InvId}`**.
- **SuccessURL** (browser) — `OutSum`, `InvId`,
  `SignatureValue = MD5(OutSum:InvId:Password1)`. User-facing only.
- **FailURL** (browser) — payment cancelled/failed.
- **Recurring** — initial payment carries `Recurring=true` (saves the card +
  anchors on its `InvId`); later charges are **merchant-initiated** POSTs to
  `https://auth.robokassa.ru/Merchant/Recurring` with a new `InvId`,
  `PreviousInvoiceID` (the anchor), `OutSum`, and the **init** signature
  (`MD5(MerchantLogin:OutSum:InvId:Password1)`). Each recurring charge notifies
  ResultURL exactly like a one-time payment.

Sources: docs.robokassa.ru/ru/pay-interface, docs.robokassa.ru/ru/quick-start,
robokassa.readthedocs.io.

## Decisions (confirmed)

| Topic | Decision |
|-------|----------|
| Order lifecycle | **pending → paid**; cart wiped **on confirmed payment** (abandoned/cancelled checkout keeps the cart). |
| Stand-in behavior | **Interactive** fake Robokassa page — Оплатить / Отменить (+ "simulate failure"); exercises Success **and** Fail paths. |
| Fiscal Receipt | **Typed stub now** — `RobokassaReceipt` type + `buildReceipt()` returning `undefined` (omitted from the signed request); real item mapping later. |
| Recurring | **Build now.** |
| Billing period | **Monthly, fixed** — stored plan price is the per-month charge. |
| Recurring trigger | **Both** — manual "charge next period now" test action **and** a cron-skeleton route hitting the same charge path. |
| Mixed cart | **Allow mixing**; recurring re-bills **only the subscription portion** (`recurring_amount` tracked separately from the one-time total). |
| Manage UI | **Profile section** — "Мои подписки" in /profile: active subs, next charge date, cancel. |

## Assumptions (call out if wrong)

- Signature algorithm = **MD5** (Robokassa default), read from config so it can
  become SHA256/384/512 later without code change.
- Config via env: `PAYMENT_PROVIDER=mock|robokassa`, `ROBOKASSA_MERCHANT_LOGIN`,
  `ROBOKASSA_PASSWORD_1`, `ROBOKASSA_PASSWORD_2`, `ROBOKASSA_IS_TEST`,
  `ROBOKASSA_HASH_ALGO`, `ROBOKASSA_BASE_URL` (prod base; mock mode targets our
  own gateway), reuse `NEXT_PUBLIC_SITE_URL` for absolute Result/Success/Fail URLs.
- `InvId = Orders.id` (already an `integer`).
- Gift-card-fully-covered orders (amount due = 0) **skip the gateway** and are
  marked paid immediately server-side.
- ResultURL/cron run with no user session → use the existing
  `createAdminClient()` (service role) after signature verification.
- Mock gateway routes return **404 when `PAYMENT_PROVIDER=robokassa`**; cron route
  guarded by a shared secret header.
- One **recurring anchor per order**: its `recurring_amount` = sum of the order's
  `Subscription`-category lines; the "Мои подписки" UI + cancel operate at the
  anchor level. (Buying two different plans in one checkout = one anchor billing
  their combined monthly sum. Noted as a known simplification.)

## Module layout

```
src/lib/payments/
  config.ts                 # env parsing, provider flag, resolved base URL
  robokassa/
    signature.ts            # pure: initSignature / resultSignature /
                            #   successSignature / recurringSignature
                            #   (Shp_ + Receipt aware, algo-configurable)
    client.ts               # buildInitRedirect(order) · parseAndVerifyResult ·
                            #   parseAndVerifySuccess · chargeRecurring(anchor,…)
    receipt.ts              # RobokassaReceipt type + buildReceipt() stub (→ undefined)
    types.ts
```

The signature module is shared by **both** our request-builder/verifier **and**
the mock gateway (which must produce a valid Password2 ResultURL signature). Only
the redirect base URL + credentials differ between mock and prod.

## Routes / endpoints

```
src/app/api/payments/robokassa/result/route.ts   # ResultURL webhook (POST+GET) → "OK{InvId}"
src/app/payments/success/route.ts                # SuccessURL → verify(P1) → /profile/orders
src/app/payments/fail/route.ts                   # FailURL → cancel pending → /checkout?payment=failed
src/app/api/payments/robokassa/cron/route.ts     # scheduler skeleton (secret-guarded)

# mock-only (404 in prod):
src/app/payments/mock/page.tsx                   # interactive fake Robokassa page
src/app/api/payments/mock/pay/route.ts           # "pay": sign(P2) → call ResultURL → 302 SuccessURL
src/app/api/payments/mock/recurring/route.ts     # mock /Merchant/Recurring → fires ResultURL
```

Checkout "pay" flow: server action → `create_pending_order` RPC → build init
redirect descriptor → client auto-POSTs to the gateway URL (real Index.aspx in
prod, `/payments/mock` in mock).

## Database (new migration `…_robokassa_payments.sql`)

- **`Orders`**: keep `status`; broaden to `CHECK (status IN
  ('pending','paid','failed','cancelled'))` default `'pending'`. Add
  `payment_provider text`, `recurring boolean default false`,
  `recurring_amount numeric(10,2) null`, `paid_at` already exists (now nullable
  until paid).
- **`UserSubscriptions`** (recurring anchor): `id`, `user_id`,
  `subscription_id` → `Subscriptions`, `anchor_order_id` → `Orders`
  (the `PreviousInvoiceID`), `status ('active'|'cancelled'|'past_due')`,
  `amount numeric(10,2)`, `current_period_start`, `next_charge_at`,
  `created_at`, `cancelled_at`. RLS owner-scoped read; writes via RPC/service role.
- **Split `place_order`**:
  - `create_pending_order(...)` — existing pricing/snapshot logic, inserts
    `status='pending'`, `paid_at=null`, computes `recurring_amount` (Subscription
    lines) + `recurring`, **does not wipe cart**. Returns `orderId`, `amountDue`,
    `recurring`.
  - `mark_order_paid(p_inv_id, p_out_sum)` — **idempotent**; verifies amount,
    sets `status='paid'`, `paid_at=now()`, wipes that user's `Cart`+`CartPromo`,
    and if `recurring` creates the `UserSubscriptions` anchor
    (`next_charge_at = now()+interval '1 month'`).
  - `charge_due_subscriptions()` / `record_recurring_charge(...)` helper for the
    cron + manual path (creates the next pending order, advances `next_charge_at`).

## App wiring

- `src/app/checkout/page.tsx` — replace the `placeOrder` + `setTimeout` stub with:
  create pending order → redirect to gateway. Keep the gift-card=0 fast path
  (immediate paid, no redirect).
- `src/lib/orders/actions.ts` — `startCheckoutAction` (pending order + redirect
  descriptor), `cancelPendingOrderAction`.
- `getOrders` / order views — already tolerate `status`; ensure pending vs paid
  badges read correctly; "Мои книги" should only unlock downloads when `paid`.
- **Profile**: new `/profile/subscriptions` ("Мои подписки") — list active
  `UserSubscriptions` (plan, monthly amount, next charge, status) + Cancel action;
  add sidebar nav item. Mock-mode-only "Списать сейчас" test button.

## Security / ops

- ResultURL: verify Password2 signature **before** any DB write; idempotent;
  service-role client; always answer `OK{InvId}` only after a successful mark.
- SuccessURL: verify Password1 but **don't** mark paid (ResultURL owns truth);
  if the order isn't paid yet (Result race), show a "processing" state.
- Mock routes hard-404 when provider≠mock; cron route requires `x-cron-secret`.
- Never log full passwords/signatures.

## Out of scope (stubbed, noted)

- Real SMTP receipts/email, real PSP credentials, real fiscalization payload
  (type only), real cron scheduling infra (skeleton route only), saved-card UI,
  multi-currency, two-stage holds (`StepByStep`).

## Verification

- `npx tsc --noEmit` + `npm run lint`.
- Manual: checkout → mock page → Оплатить → ResultURL `OK{id}` → Success →
  order `paid`, cart emptied; Отменить → Fail → order `cancelled`, cart kept.
- Recurring: buy a subscription → anchor in "Мои подписки" → "Списать сейчас" →
  new `paid` order, `next_charge_at` advanced a month → Cancel → no further charges.
- Signature parity: unit-check the four signature formulas against a known
  Robokassa test vector so prod swap is trusted.
```
