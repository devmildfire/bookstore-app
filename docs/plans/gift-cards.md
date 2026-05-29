# Gift cards (`/gift-cards`, wallet, payment integration)

**Status**: Planned
**Branch**: `update`
**Figma**: 1119:10288 (storefront tier strip) — only the visual reference is
in Figma. Wallet UI is a new component family that mirrors `/profile`'s
existing card-style sections.

---

## Goal

Add a gift-card-as-wallet feature on top of the existing storefront:

1. **Storefront page** `/gift-cards` — three product tiers (Прелесть /
   Благость / Трансцендент @ 500 / 1000 / 5000 ₽) with quantity steppers
   and add-to-cart buttons. Layout mirrors the «Подписки» section already
   on the home page.
2. **Wallet page** `/profile/gift-cards` — lists every card the user owns
   with face value, remaining balance, status badge, code reveal, and
   «Отправить в подарок» action.
3. **Checkout integration** — buyer can pick any number of their wallet
   cards at `/checkout` to cover all or part of the order. Remainder goes
   to the existing PSP stub.

Anonymous purchase + sign-in migration are first-class, identical to how
`Cart` and `Orders` already migrate via the `migrate_anonymous_user` RPC.

---

## Locked decisions

| Topic | Decision | Why |
|---|---|---|
| Denominations | `GiftCardProducts` table seeded with the 3 tiers; rendered dynamically | Future ops can add/edit tiers without code |
| Buyer flow | Card always lands in **buyer's wallet** after purchase | One predictable destination; sharing is a follow-up action |
| Send model | **One-time claim link**. Server mints a `claim_token`, sender copies the URL (`/redeem/<token>`) and shares via any channel. SMTP is stubbed; an optional `pending_recipient_email` is recorded for the sender's bookkeeping. | Decouples send from email; works for messengers, email, anything |
| Post-send state | Card is **locked** (`status='pending'`) — balance frozen, sender cannot apply or cancel via UI | Matches the answer "sent cards are locked forever until claimed". The only way it leaves `pending` is a successful `/redeem/<token>` click. |
| Self-claim | Sender clicking their own link is a normal claim and ends with the card back in their wallet | Same RPC path; no special branch. Effectively the only way a sender ever reclaims. |
| Token expiry | None | Pending cards stay pending until claimed. Simple. |
| Re-gifting | Any `active` card with `balance > 0` can be sent again; a fresh `claim_token` is minted each time | A partial-spend card is still giftable |
| Cart UX | One row per tier, qty stepper | Mirrors subscriptions; cleanest UI |
| Code generation | At `place_order` RPC, one unique code per unit of qty | Atomic with order creation |
| Promo codes | Gift-card cart items are **excluded** from promo discounts everywhere totals are computed | Prevents face-value arbitrage |
| Wallet code display | Code hidden behind a «Показать код» button + copy-to-clipboard | Mild shoulder-surf hedge |
| Checkout selection | Wallet card list with checkboxes; biggest-first consumption, capped to the non-gift-card eligible total | Buyer-controlled; no balance left undelivered; cards cannot buy cards |
| Expiry / refund | None | Matches the project's no-cancellation `Orders` model |
| Anon buyers | Allowed; `GiftCards.owner_user_id` migrates on sign-in via the existing `migrate_anonymous_user` RPC | Same pattern as Cart + Orders |
| Anon wallet visibility | `/profile/gift-cards` renders the anon's own cards | Existing profile cabinet is reachable by anons; consistent |
| Profile sidebar | New **«Карты даров»** item → `/profile/gift-cards` | Sibling of «Мои книги», «Избранное» |
| Storefront CTA | Each tier card has its own qty stepper + add-to-cart button | Simple, no extra route |

---

## Data layer changes

### Migration: `20260528xxxxxx_gift_cards.sql`

```sql
-- ─── 1. Tier catalogue ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GiftCardProducts" (
  id          serial  PRIMARY KEY,
  slug        text    NOT NULL UNIQUE,
  name        text    NOT NULL,
  face_value  integer NOT NULL CHECK (face_value > 0), -- in ₽
  sort_order  integer NOT NULL DEFAULT 0
);

ALTER TABLE "GiftCardProducts" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read gift card products" ON "GiftCardProducts";
CREATE POLICY "Public read gift card products" ON "GiftCardProducts"
  FOR SELECT USING (true);

INSERT INTO "GiftCardProducts" (slug, name, face_value, sort_order) VALUES
  ('prelest',      'Прелесть',     500,  0),
  ('blagost',      'Благость',     1000, 1),
  ('transcendent', 'Трансцендент', 5000, 2)
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. Issued cards ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "GiftCards" (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code                     text        NOT NULL UNIQUE,    -- private code shown via «Показать код»
  product_id               integer     NOT NULL REFERENCES "GiftCardProducts"(id),
  owner_user_id            uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_value            integer     NOT NULL,
  balance                  integer     NOT NULL CHECK (balance >= 0),
  status                   text        NOT NULL DEFAULT 'active'
                                        CHECK (status IN ('active', 'pending', 'depleted')),
  claim_token              text        UNIQUE,             -- random URL-safe token; non-null iff status='pending'
  pending_recipient_email  text,                           -- sender-supplied bookkeeping; optional
  sent_at                  timestamptz,                    -- non-null iff status='pending'
  order_id                 integer     REFERENCES "Orders"(id) ON DELETE SET NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gift_cards_balance_bounds CHECK (balance <= initial_value),
  CONSTRAINT gift_cards_status_balance CHECK (
    (status = 'depleted' AND balance = 0)
    OR (status IN ('active', 'pending') AND balance > 0)
  ),
  CONSTRAINT gift_cards_pending_token_state CHECK (
    (status = 'pending' AND claim_token IS NOT NULL AND sent_at IS NOT NULL)
    OR (status <> 'pending' AND claim_token IS NULL AND sent_at IS NULL)
  )
);

CREATE INDEX gift_cards_owner_active_idx
  ON "GiftCards" (owner_user_id) WHERE status = 'active';
CREATE INDEX gift_cards_claim_token_idx
  ON "GiftCards" (claim_token) WHERE claim_token IS NOT NULL;

ALTER TABLE "GiftCards" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own gift cards" ON "GiftCards"
  FOR SELECT USING (auth.uid() = owner_user_id);

-- No public token SELECT policy. Token redemption happens only through
-- redeem_gift_card_token(p_token), which never exposes private card rows.

-- ─── 3. Order-side application log ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS "OrderGiftCardApplications" (
  id            serial      PRIMARY KEY,
  order_id      integer     NOT NULL REFERENCES "Orders"(id) ON DELETE CASCADE,
  gift_card_id  uuid        NOT NULL REFERENCES "GiftCards"(id),
  amount        integer     NOT NULL CHECK (amount > 0),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_gift_card_apps_order_idx
  ON "OrderGiftCardApplications" (order_id);

ALTER TABLE "OrderGiftCardApplications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Order gift card apps select own" ON "OrderGiftCardApplications"
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM "Orders" o
      WHERE o.id = "OrderGiftCardApplications".order_id
        AND o.user_id = auth.uid()
    )
  );

-- If place_order stays SECURITY INVOKER, add a matching INSERT WITH CHECK
-- policy; if it becomes SECURITY DEFINER, keep client inserts locked down.

-- ─── 4. Extend Orders snapshot ─────────────────────────────────────────
ALTER TABLE "Orders"
  ADD COLUMN IF NOT EXISTS gift_card_total_applied numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS amount_due numeric(10,2) NOT NULL DEFAULT 0;
```

### Cart product type

The existing `Cart` table supports multiple product types (`PrintBook`,
`Book2.0`, `EBook`, `AudioBook`, `GiftCard`, `BoxSet`, `Subscription`,
`Course`). Reuse the existing `GiftCard` category; do not add
`GiftCardProduct`.

Gift-card cart rows use:

```txt
Cart.category = 'GiftCard'
Cart.id       = 'GiftCard-{GiftCardProducts.id}'
```

The `GiftCardProducts.id` is parsed from the `Cart.id` suffix when the order
RPC issues purchased cards.

### Code format

Visible wallet code: `XXXX-XXXX-XXXX-XXXX` — 16 chars in 4 hyphenated
blocks, drawn from the unambiguous alphabet
`ABCDEFGHJKMNPQRSTUVWXYZ23456789` (no I/O/0/1). Generated server-side inside
the `place_order` RPC; retried on the rare UNIQUE-violation.

Claim token: URL-safe random token for `/redeem/<token>`, using only
letters, digits, `_`, and `-`. Generate it with base64url semantics, e.g.:

```sql
rtrim(translate(encode(gen_random_bytes(32), 'base64'), '+/', '-_'), '=')
```

The route validates the path token before calling the RPC:

```ts
const CLAIM_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,128}$/
```

### `send_gift_card` RPC (separate migration)

```sql
-- Mints a fresh claim_token and locks the card. Owner-only.
CREATE OR REPLACE FUNCTION public.send_gift_card(
  p_card_id        uuid,
  p_recipient_email text
) RETURNS text  -- returns the new claim_token
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token text;
BEGIN
  -- only owner can send; card must be active with positive balance
  UPDATE "GiftCards"
     SET status                  = 'pending',
         claim_token             = rtrim(translate(encode(gen_random_bytes(32), 'base64'), '+/', '-_'), '='),
         pending_recipient_email = p_recipient_email,
         sent_at                 = now()
   WHERE id = p_card_id
     AND owner_user_id = auth.uid()
     AND status        = 'active'
     AND balance       > 0
  RETURNING claim_token INTO v_token;

  IF v_token IS NULL THEN
    RAISE EXCEPTION 'Card not found, not yours, depleted, or already pending';
  END IF;

  RETURN v_token;
END $$;

REVOKE ALL ON FUNCTION public.send_gift_card(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.send_gift_card(uuid, text) TO authenticated;
```

### `redeem_gift_card_token` RPC (separate migration)

```sql
-- Transfers a pending card to the calling user (real or anon). Idempotent
-- iff token has already been consumed (returns NULL).
CREATE OR REPLACE FUNCTION public.redeem_gift_card_token(p_token text)
RETURNS uuid  -- returns the now-active card id, or NULL if token invalid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_card_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE "GiftCards"
     SET owner_user_id           = auth.uid(),
         status                  = 'active',
         claim_token             = NULL,
         pending_recipient_email = NULL,
         sent_at                 = NULL
   WHERE claim_token = p_token
     AND status      = 'pending'
  RETURNING id INTO v_card_id;

  RETURN v_card_id;
END $$;

REVOKE ALL ON FUNCTION public.redeem_gift_card_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_gift_card_token(text) TO anon, authenticated;
```

Self-claim (sender clicks their own URL) takes the same code path; the
card simply lands back under the same `owner_user_id` with status reset.

`/redeem/[token]/page.tsx` must guarantee a user exists before calling the
RPC. It reads the server Supabase user; if none exists, it creates an
anonymous session server-side, then calls `redeem_gift_card_token`. The RPC's
`auth.uid()` guard is the database backstop for direct calls. No token preview
is required: success redirects to `/profile/gift-cards?redeemed=1`; invalid or
already-claimed tokens render an error panel.

### `place_order` RPC extension (separate migration)

The existing RPC inserts `Orders` + `OrderItems` atomically. Extend to:

1. Detect gift-card lines in the Cart. For each unit of quantity, insert
   one `GiftCards` row (`code = generate_gift_card_code()`,
   `initial_value = product.face_value`, `balance = face_value`,
   `owner_user_id = current_user`, `order_id = new_order_id`).
2. Accept a `p_gift_cards jsonb` argument: `[{"id": uuid, "amount": int}, …]`
   from the client. Parse it into rows, reject duplicate card IDs, then lock
   selected cards in deterministic ID order before any balance changes:
   ```sql
   SELECT *
   FROM "GiftCards"
   WHERE id = ANY(v_card_ids)
   ORDER BY id
   FOR UPDATE;
   ```
   Verify every requested card exists, is owned by `auth.uid()`, has
   `status = 'active'`, and has enough balance.
3. Compute `v_gift_card_eligible_total` from the same final pricing model as
   the order total, but excluding `Cart.category = 'GiftCard'` rows. Wallet
   cards can pay for books, subscriptions, courses, and box sets, but never
   for newly purchased gift cards. Reject payloads where
   `gift_card_total_applied > v_gift_card_eligible_total`.
4. Deduct each amount, flip `status` to `'depleted'` if `balance` hits 0, and
   insert an `OrderGiftCardApplications` row.
5. Write `gift_card_total_applied` on the `Orders` row.
6. Keep `Orders.total` as the full final order value after built-in and promo
   discounts, before gift-card payment. Store payment snapshots as:
   ```txt
   Orders.total = merchandise/order total after built-in and promo discounts
   Orders.gift_card_total_applied = wallet amount used on this order
   Orders.amount_due = max(0, Orders.total - Orders.gift_card_total_applied)
   ```
   `paid_at` remains the order-completion timestamp for both PSP-paid and
   fully gift-card-covered orders.
7. Wipe `Cart` + `CartPromo` as today.

If any step fails, the whole RPC rolls back — no half-applied cards.

### Promo-code interaction

Gift-card rows count toward amount owed, but never toward promo-discount
base. A cart with a 1000 ₽ gift card, a 1000 ₽ book, and `SUMMER25` owes
1000 + 750 = 1750 ₽, not 1500 ₽.

Update every pricing surface:

- `apply_promo_code` still validates codes and target presence; item-target
  matching should ignore `Cart.category = 'GiftCard'` rows where relevant.
- `src/lib/cartTotals.ts` excludes gift-card rows from `originalSum`,
  `bookDiscountTotal`, cart-level promo base, and item-level promo matching.
- `place_order` mirrors the same exclusion server-side when recomputing
  immutable order totals.
- `docs/conventions/DATA.md` and `docs/testing/promo-codes.md` document the
  rule and manual test.

### Anon → real-user migration

Extend `migrate_anonymous_user` RPC:

```sql
UPDATE "GiftCards"
   SET owner_user_id = to_user_id
 WHERE owner_user_id = from_user_id;
```

---

## Entity layer

```
src/entities/giftCardProduct/
  client.ts        // { id, slug, name, faceValue, sortOrder }
  server.ts        // QueryData<typeof giftCardProductsQuery>
  normalize.ts

src/entities/giftCard/
  client.ts        // { id, code, productId, productName, faceValue, balance, status, orderId, recipientEmail, sentAt, createdAt }
  server.ts
  normalize.ts
```

## API modules

```
src/api/giftCards/
  getGiftCardProducts.ts     // public — for /gift-cards storefront
  getUserGiftCards.ts        // owner-scoped — for /profile/gift-cards
  sendGiftCard.ts            // server action: calls send_gift_card RPC, returns claim_token
  redeemGiftCardToken.ts     // server action: calls redeem_gift_card_token RPC
  addGiftCardToCart.ts       // mirrors addBookToCart pattern
```

## Component layout

```
src/app/
  gift-cards/
    page.tsx                 // RSC: fetches getGiftCardProducts(), composes
    page.module.scss
  profile/
    gift-cards/
      page.tsx               // RSC: fetches getUserGiftCards()
      page.module.scss
  redeem/
    [token]/
      page.tsx               // ensures user/anon session, calls redeem RPC, redirects
      RedeemResult.tsx       // client-side toast trigger on success/error

src/components/giftCards/
  GiftCardStorefront/        // intro copy block + GiftCardTierCard grid
    GiftCardStorefront.tsx
    GiftCardStorefront.module.scss
  GiftCardTierCard/          // 1 of the 3 tiers on the storefront
    GiftCardTierCard.tsx     // qty stepper + add-to-cart
    GiftCardTierCard.module.scss
  GiftCardWalletList/        // wallet — list of user's cards
    GiftCardWalletList.tsx
    GiftCardWalletList.module.scss
  GiftCardWalletItem/        // one card row: face value, balance, code reveal, send btn
    GiftCardWalletItem.tsx
    GiftCardWalletItem.module.scss
  SendGiftCardDialog/        // Radix Dialog: optional recipient e-mail → mint token → reveal URL with copy button
    SendGiftCardDialog.tsx
    SendGiftCardDialog.module.scss

src/components/checkout/
  GiftCardPicker/            // wallet selector inside /checkout
    GiftCardPicker.tsx
    GiftCardPicker.module.scss
```

## Profile sidebar

Update `src/components/profile/ProfileSideNav/ProfileSideNav.tsx`:
add a new `NavItem` between **«Мои книги»** and **«Избранное»**:

```ts
{ href: '/profile/gift-cards', exact: false, label: 'Карты даров', Icon: GiftCardIcon },
```

A new line-art SVG icon goes under `src/assets/icons/gift-card.svg`.

---

## /gift-cards storefront layout

Mirrors the home-page «Подписки» section visually:

```
┌──────────────────── ${section-bg} ────────────────────┐
│                  «КАРТЫ ДАРОВ»                        │
│                                                       │
│  [intro paragraph left]      [longer paragraph right] │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Прелесть │  │ Благость │  │ Трансц.  │             │
│  │  500 ₽   │  │  1000 ₽  │  │  5000 ₽  │             │
│  │ [- 1 +]  │  │ [- 1 +]  │  │ [- 1 +]  │             │
│  │ [Купить] │  │ [Купить] │  │ [Купить] │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└───────────────────────────────────────────────────────┘
```

The two intro paragraphs are hard-coded from the user's mockup. Card
container uses the same `$color-inner-panel-dark` panel + `$radius-md`
treatment subscriptions already use.

Add-to-cart button reuses `OutlinedButton` (with `fitContainer` on the
phone breakpoint).

## /profile/gift-cards wallet layout

```
Карты даров
─────────────────────────────────────
┌─────────────────────────────────┐
│  Прелесть · 500 ₽               │
│  Остаток: 280 ₽                 │
│  Код: ●●●●-●●●●-●●●●-●●●●   ▸   │
│  [Отправить в подарок]          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│  Благость · 1000 ₽   (отправлено) │
│  Получатель: foo@bar.ru         │
│  Дата: 2026-05-28               │
│  Ссылка для получателя:         │
│  https://…/redeem/abc123  [📋]  │
└─────────────────────────────────┘
…
```

Empty state: «У вас пока нет карт даров. [Перейти к покупке]».

The pending-state row keeps the claim URL visible + copyable so the
sender can re-share it through any channel. There's no «Отменить»
button — clicking the URL is the only way the card leaves `pending`
(answer: "sent cards are locked forever until claimed"; self-claim is
the only escape hatch).

## /checkout `GiftCardPicker`

Sits above the existing «Оплата» / address section. Pulls the user's
active cards (`status = 'active'` + `balance > 0`), shows checkboxes
with «Применено: X ₽ из Y ₽» running total, and caps application at the
non-gift-card eligible total. When the running total covers the eligible
amount due, the confirmation modal uses `amount_due` to swap
«Подтвердить оплату» for «Оформить заказ» and skips the PSP stub when
`amount_due = 0`.

---

## Responsive strategy

| Breakpoint | Storefront layout | Wallet layout |
|---|---|---|
| desktop (>1200) | 3-column tier grid, side-by-side intro paragraphs | Single column, card rows full-width capped at 720 px |
| tablet (≤1200) | 3-column tier grid (smaller cards) | Same |
| tablet-small (≤767) | Single column tier stack | Single column, edge-to-edge |
| phone (≤532) | Single column tier stack | Single column, edge-to-edge |

---

## Out of scope (deferred)

- Real SMTP / email delivery — UI is in place (email form + "Отправить" button in `SendGiftCardDialog`); the server action persists `pending_recipient_email` but does not yet ship a message. See [Email delivery (follow-up)](#email-delivery-follow-up) for the rollout plan.
- "Cancel send" button on pending cards (locked-forever-until-claimed is the rule)
- Claim-token expiry / cleanup job
- Refunds / cancellations / chargebacks of orders
- Card expiration on its own
- Admin tool to issue cards outside of purchase (manual top-up)
- Box-sets that include a gift card
- Home-page section showcasing gift cards
- Gift-card balance shown in cart header (e.g. «Доступно X ₽ на ваших картах»)
- Notifying the sender when a recipient claims (no claim event log yet)

---

## Email delivery (follow-up)

The dialog already exposes the "send by email" path — when picked it calls
`send_gift_card(card_id, recipient_email)` which persists
`pending_recipient_email` and mints the `claim_token`, but does NOT ship a
message. The follow-up phase wires real transactional email so that
choosing the email form actually delivers the claim link to the
recipient.

### Provider choice — Resend vs Brevo

Both are SaaS, both have a free tier, both can be swapped behind the
same internal wrapper (`src/lib/email/`), so the decision is reversible.

| Aspect | **Resend** (recommended) | **Brevo** (ex-Sendinblue) |
|---|---|---|
| Developer ergonomics | Single REST endpoint, official `resend` npm SDK, React-Email JSX templates work out of the box | REST API + Node SDK, templates managed in dashboard or HTML strings |
| Free tier | 3 000 emails / month, 100 / day | 300 / day (≈ 9 000 / month) |
| EU residency | EU region toggle (Frankfurt) | Headquartered in France, EU-first |
| Webhooks | Delivered / bounced / complained | Same + read / click tracking |
| Domain setup | SPF + DKIM (no MX needed); ~10 min | SPF + DKIM (no MX needed); ~10 min |
| Lock-in risk | Lowest — small surface, easy to migrate | Slightly higher — heavier dashboard tooling |

**Recommendation:** start with **Resend** because the JSX template story
matches the rest of the React codebase and the transactional surface is
the smallest. If volume grows past the free tier or the customer wants
EU-by-default contracts, Brevo is the fallback — the wrapper below
makes that a one-file change.

### Architecture

```
src/lib/email/
  client.ts            // single function: sendTransactionalEmail({ to, subject, html, text })
                       //   - reads RESEND_API_KEY + EMAIL_FROM from env
                       //   - returns { ok: true, id } | { ok: false, error }
                       //   - never throws; caller always gets a tagged result
  templates/
    giftCard.ts        // buildGiftCardEmail({ recipientEmail, senderName, productName, faceValue, claimUrl })
                       //   returns { subject, html, text }
```

- **Server-only.** `'use server'` modules and the existing `sendGiftCard`
  server action import `client.ts` directly. No client-bundle risk
  because the API key never leaves the server.
- **Result type, not throws.** The wrapper returns
  `{ ok: false, error }` on provider failure so the server action can
  decide whether to surface "письмо не отправлено, вот ссылка" instead
  of failing the whole flow.
- **Internationalisation.** Templates are Russian only (matches the rest
  of the site).

### `sendGiftCard` server action change

```ts
const { data: token, error } = await supabase.rpc('send_gift_card', { … })
if (error || !token) return { status: 'error', message: … }

const claimUrl = `${origin}/redeem/${token}`

if (recipientEmail) {
  const email = buildGiftCardEmail({ recipientEmail, senderName, productName, faceValue, claimUrl })
  const send  = await sendTransactionalEmail({ to: recipientEmail, ...email })
  if (!send.ok) {
    // Token was minted; degrade gracefully — caller copies the URL by hand.
    return { status: 'ok', claimUrl, claimToken: token, emailStatus: 'failed', emailError: send.error }
  }
  return { status: 'ok', claimUrl, claimToken: token, emailStatus: 'sent' }
}

return { status: 'ok', claimUrl, claimToken: token, emailStatus: 'skipped' }
```

The dialog reads `emailStatus` to pick the toast copy:

| `emailStatus` | Toast |
|---|---|
| `sent` | «Письмо отправлено» + recipient email as description |
| `failed` | «Письмо не отправлено», description = error. Surface the claim URL inline so the sender can share manually. |
| `skipped` | Existing claim-URL panel (link flow). |

### Env vars

```
# .env.local (dev) + production env
RESEND_API_KEY=re_...
EMAIL_FROM="Чтиво <noreply@chtivo.spb.ru>"
EMAIL_REPLY_TO=hello@chtivo.spb.ru        # optional
```

The wrapper hard-fails (`ok: false`) if either var is missing rather
than 500-ing the server action; the dialog then falls back to the
claim-URL panel.

### DNS

- Add SPF record for the chosen provider on `chtivo.spb.ru`.
- Add the DKIM CNAME triplet the provider gives you.
- Confirm `noreply@chtivo.spb.ru` exists as a verified sender in the
  provider dashboard before flipping the env vars in production.
- No MX record changes — we are sending only, not receiving.

### Template content (Russian)

- **Subject:** «Вам подарили карту «{productName}» — {faceValue} ₽».
- **Body (html + text):**
  - Greeting using `recipientEmail` (no name — we don't collect one).
  - One sentence explaining what Чтиво is.
  - The claim URL as a button + as plain text fallback.
  - Footer: «Если письмо пришло по ошибке, просто проигнорируйте его — ссылку можно открыть только один раз.»
- Keep the design plain HTML, no external assets — fewer spam triggers
  and no broken images in dark-mode clients.

### Failure & abuse considerations

- **Idempotency.** `send_gift_card` already flips the card to `pending`
  in a single UPDATE; running the action twice on the same card raises
  the existing "card not found / already pending" error, so the email
  send is naturally one-shot.
- **Rate limiting.** Resend / Brevo enforce per-account throughput;
  Supabase RLS already restricts the RPC to the card owner. No extra
  app-side limiter needed in the follow-up.
- **Bounce handling.** Out of scope for the first pass. If a bounce
  webhook fires, surface it later — for now the sender still has the
  claim URL.
- **Privacy.** `pending_recipient_email` is already persisted; the
  email send adds no new PII. Provider logs should be configured with
  the minimal retention the dashboard allows.

---

## Tracker

Update the checkboxes as you go.

### Phase 1 — data layer

- [ ] Migration `20260528xxxxxx_gift_cards.sql` (GiftCardProducts + GiftCards with URL-safe claim_token/pending_recipient_email/sent_at + lifecycle CHECK constraints + OrderGiftCardApplications + Orders `gift_card_total_applied`/`amount_due` columns).
- [ ] Seed the 3 default tiers in the same migration.
- [ ] Gift-card cart rows use existing `Cart.category = 'GiftCard'` and `Cart.id = 'GiftCard-{GiftCardProducts.id}'`.
- [ ] `OrderGiftCardApplications` RLS added (owner can read via parent order; no direct client writes unless `place_order` remains SECURITY INVOKER).
- [ ] `place_order` RPC extended to issue cards + apply selected ones with deterministic row locks, duplicate-payload rejection, non-gift-card eligibility cap, and `amount_due` snapshot.
- [ ] `send_gift_card(card_id, recipient_email)` RPC — hardened SECURITY DEFINER; mints URL-safe `claim_token`, sets `status='pending'`.
- [ ] `redeem_gift_card_token(token)` RPC — hardened SECURITY DEFINER; rejects NULL `auth.uid()`, transfers ownership, clears token.
- [ ] Promo discount exclusion for `GiftCard` rows implemented in `apply_promo_code`, `src/lib/cartTotals.ts`, and `place_order`.
- [ ] `migrate_anonymous_user` RPC also migrates `GiftCards.owner_user_id`.
- [ ] `src/types/supabase.ts` regenerated.
- [ ] Code-generation SQL function `generate_gift_card_code()` (UNIQUE retry loop).

### Phase 2 — entity + API layer

- [ ] `src/entities/giftCardProduct/{client,server,normalize}.ts`.
- [ ] `src/entities/giftCard/{client,server,normalize}.ts`.
- [ ] `src/api/giftCards/getGiftCardProducts.ts`.
- [ ] `src/api/giftCards/getUserGiftCards.ts`.
- [ ] `src/api/giftCards/sendGiftCard.ts` (server action wrapping `send_gift_card` RPC; returns the claim URL).
- [ ] `src/api/giftCards/redeemGiftCardToken.ts` (server action wrapping `redeem_gift_card_token` RPC).
- [ ] `src/api/giftCards/addGiftCardToCart.ts`.

### Phase 3 — storefront

- [ ] `src/components/giftCards/GiftCardTierCard/` — qty stepper + add-to-cart, OutlinedButton CTA.
- [ ] `src/components/giftCards/GiftCardStorefront/` — header + intro paragraphs + tier grid.
- [ ] `src/app/gift-cards/page.tsx` (+ metadata, + page.module.scss).
- [ ] Cart UI rendering for gift-card rows (mirrors subscriptions row pattern).

### Phase 4 — wallet + redeem

- [ ] Gift-card icon SVG at `src/assets/icons/gift-card.svg`.
- [ ] `ProfileSideNav` adds «Карты даров» nav item.
- [ ] `src/components/giftCards/GiftCardWalletItem/` — three states: `active` (code reveal + copy + «Подарить»), `pending` (claim URL visible + copy + locked badge), `depleted` (greyed).
- [ ] `src/components/giftCards/GiftCardWalletList/` — list + empty state.
- [ ] `src/components/giftCards/SendGiftCardDialog/` — Radix dialog (optional recipient e-mail field → submit → display claim URL with copy button).
- [ ] `src/app/profile/gift-cards/page.tsx` (+ metadata, + page.module.scss).
- [ ] `src/app/redeem/[token]/page.tsx` — validates URL-safe token, ensures user/anon session server-side, calls redeem RPC, redirects to `/profile/gift-cards?redeemed=1` on success, renders an error panel on invalid/already-claimed token.

### Phase 5 — checkout integration

- [ ] `src/components/checkout/GiftCardPicker/` — wallet card list + checkboxes + running total capped to non-gift-card eligible total.
- [ ] `/checkout` page integrates the picker; selected card IDs + amounts go into the `place_order` RPC payload.
- [ ] Confirmation modal copy swaps to «Оформить заказ» when `amount_due = 0`.
- [ ] Skip the PSP stub when `amount_due = 0`.

### Phase 6 — verification

- [ ] `npm run dev` walk: storefront → add to cart → checkout (no gift-cards applied) → wallet shows new cards with codes.
- [ ] Walk: storefront → add to cart → checkout (partial gift-card applied) → wallet shows balance decremented.
- [ ] Walk: storefront → add to cart → checkout (full gift-card coverage) → confirmation modal skips PSP stub.
- [ ] Send flow: open wallet item → «Подарить» → optional recipient email → modal returns a claim URL → row flips to `pending`, balance frozen.
- [ ] Claim flow: open the URL in a fresh anon session → `/redeem/<token>` lands on `/profile/gift-cards` → card now in anon's wallet.
- [ ] Direct RPC call with no `auth.uid()` cannot claim a card.
- [ ] Anon claim → sign in → card migrates to the real account.
- [ ] Self-claim: open one's own claim URL → card returns to current user's wallet, status back to `active`.
- [ ] Re-gift: claim card, partially spend at checkout, then `Подарить` again → fresh `claim_token`, prior URL invalidated.
- [ ] Anonymous purchase → sign in → cards present in `/profile/gift-cards` of the real account.
- [ ] Promo-code applied to a cart containing both a book and a gift card → only the book line is discounted.
- [ ] Wallet gift card applied to a cart containing both a book and a new gift card → wallet application is capped to the non-gift-card eligible total.
- [ ] Lint + tsc clean.

### Phase 7 — email delivery (follow-up)

- [ ] Provider account created (Resend by default; Brevo if EU-residency requirement comes up).
- [ ] DNS: SPF + DKIM records added on `chtivo.spb.ru`; sender verified in provider dashboard.
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` (and optional `EMAIL_REPLY_TO`) added to `.env.local` and the production env.
- [ ] `src/lib/email/client.ts` — `sendTransactionalEmail({ to, subject, html, text })`; returns `{ ok, id } | { ok: false, error }`; reads env, never throws.
- [ ] `src/lib/email/templates/giftCard.ts` — `buildGiftCardEmail(...)` → `{ subject, html, text }` (Russian copy, plain HTML, no external assets).
- [ ] `sendGiftCard` server action invokes the wrapper when `recipientEmail` is non-null; returns `emailStatus: 'sent' | 'failed' | 'skipped'` alongside the existing `claimUrl`.
- [ ] `SendGiftCardDialog` branches its toast / inline panel on `emailStatus` (`sent` → success toast; `failed` → fallback to claim-URL panel + error toast; `skipped` → existing link-flow panel).
- [ ] Verification: send to a real inbox → arrives within ~30 s → link claims correctly.
- [ ] Verification: provider key removed temporarily → email flow degrades to the claim-URL fallback (no 500, no orphan state).

---

## Open questions — all resolved

All Q&A answered before this doc was written:

1. **Denominations** — dynamic DB list, three seeded tiers.
2. **Buyer flow** — card lands in buyer's wallet; sharing is manual.
3. **Apply at checkout** — wallet picker, biggest-first internally.
4. **Send model** — claim link with a `claim_token`; sender copies URL, shares any channel. Optional `pending_recipient_email` is bookkeeping only.
5. **Anon buyers** — allowed, migrate on sign-in.
6. **Post-send** — `status='pending'`, balance frozen, no «Cancel send» UI.
7. **Cart row** — one row per tier with qty.
8. **Promo on cards** — excluded from discount base.
9. **Code display** — hidden behind «Показать код».
10. **Lifecycle** — no expiry, no refund.
11. **Profile location** — `/profile/gift-cards`, new sidebar item.
12. **Storefront CTA** — per-tier qty stepper + add-to-cart.
13. **Anon wallet** — visible to anons.
14. **Cancel send** — none (locked until claimed).
15. **Token expiry** — none.
16. **Self-claim** — normal claim path (the only practical "cancel").
17. **Re-gift** — any `active` card with `balance > 0` can be sent again, fresh token each time.
