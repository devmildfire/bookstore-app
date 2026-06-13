# Email system (Resend) — plan

Status: **P0–P6 implemented and live-tested** (2026-06-13). All transactional email +
mailing-list scaffolding works end-to-end against the verified `mildfire.dev` domain and the
Resend Audience. Remaining = prod-only cutover items in P7 (`NEXT_PUBLIC_BASE_URL`, prod hook
URL/secret).

Single source of truth for all outbound email: **transactional** (auth confirmation,
password reset, order confirmation, admin notifications) and the scaffolding for a
future **mailing list**. Provider: **Resend** (`resend@4.8.0` + `@react-email/components@1.0.12`,
both already installed). `RESEND_API_KEY` is set in `.env`.

This plan **superseded** `docs/plans/story-submission-notifications.md` (the admin
story-submission notification is folded in here, Phase 5) — that doc has been deleted.

---

## Locked decisions (from requirements Q&A)

| Topic | Decision |
|-------|----------|
| Email verification on registration | **Required (double opt-in)** — `enable_confirmations = true`. |
| Unconfirmed-user UX | **Soft gate** — user stays signed in and can shop/checkout; persistent "Подтвердите email" banner + resend button until confirmed. (Applies to the anon→account upgrade; a brand-new `signUp` has no session until confirmed → "check your email" screen.) |
| Emails to build now | Welcome/confirmation, password reset, order & payment confirmation, admin "new story submission". |
| Auth-email routing | **Supabase Auth Send-Email Hook** → our endpoint renders React Email + sends via Resend SDK. One templating path for *all* email. |
| App-email routing | Resend SDK directly from server code. |
| Sending domain | **Resend test mode for now** (`onboarding@resend.dev`, can only reach the account owner's address). Real verified domain = pre-launch tracker item (T1). |
| Mailing list storage | **Own `Subscribers` Postgres table = source of truth**, synced to a **Resend Audience** for future broadcasts. |
| Mailing-list opt-in | **Double opt-in** (confirm-subscription email + token). One-click unsubscribe token on every send. |
| Subscriber identity | **Account optional** — `Subscribers.user_id` nullable; anonymous visitors can subscribe. |
| Opt-in surfaces | Wire the existing **/about `StayWithUsForm`** and **/contacts `NewsletterForm`** stubs. (Investors page: no form, not in scope now.) |
| Admin notify recipient | Address from a new env var **`ADMIN_NOTIFICATIONS_EMAIL`**. |
| Broadcast campaigns | **Out of scope** — scaffold the list + Audience sync only; no sending UI/cron. |

---

## Architecture overview

```
                         ┌───────────────────────────────────────────────┐
                         │  src/lib/email/  (one path for everything)      │
   Supabase Auth ──hook──▶  resend.ts (client)  +  send.ts (render+send)   │
   (GoTrue: signup,       │  templates: src/emails/*.tsx (React Email)     │
    recovery, email_      └───────────────────────────────────────────────┘
    change) calls our                 ▲                     ▲
    /api/auth/hooks/                  │                     │
    send-email                  app server code        Resend SDK → Resend API
                                (actions, webhooks)
```

- **Auth emails** (signup confirm, password recovery, email-change confirm) are generated
  by GoTrue, which calls our **Send-Email Hook**; we render the matching React Email
  template and send via Resend. GoTrue never sends directly.
- **App emails** (order confirmation, admin notify, newsletter confirm/welcome) are sent
  straight from server code via the same `send.ts` helper.
- **Newsletter** subscribers live in `Subscribers`; on confirmation they're pushed to a
  Resend **Audience** (`RESEND_AUDIENCE_ID`) so future broadcasts can target them.

### New environment variables (add to `.env` + document in `.env.example`)

| Var | Purpose | Dev value |
|-----|---------|-----------|
| `RESEND_API_KEY` | Resend SDK auth | **set** |
| `RESEND_FROM_EMAIL` | Default From | `Чтиво <onboarding@resend.dev>` (test) |
| `SEND_EMAIL_HOOK_SECRET` | Verify Supabase auth hook calls (Standard Webhooks `v1,whsec_…`) | generate |
| `ADMIN_NOTIFICATIONS_EMAIL` | Story-submission notify target | your address |
| `RESEND_AUDIENCE_ID` | Resend Audience for the mailing list | create once (T2) |
| `NEXT_PUBLIC_BASE_URL` | Build absolute links in emails (reuses the existing payments var) | `http://localhost:3000` |

---

## Tracker (resume here if interrupted)

Legend: ⬜ not started · 🟡 in progress · ✅ done · ⏸️ blocked

| # | Phase | Status | Notes |
|---|-------|--------|-------|
| P0 | Foundations: Resend client, `send.ts`, React Email base layout, env wiring | ✅ | live-tested 2026-06-13 (delivered) |
| P1 | Auth Send-Email Hook endpoint + `config.toml` wiring + signature verify | ✅ | live-tested; **fixed a launch-blocking bug** (hook sent to empty `user.email` on email_change — commit 274694e8) |
| P2 | Registration confirmation + soft-gate UX (`enable_confirmations`, banner, resend, anon-upgrade path, optional welcome) | ✅ | live-tested (anon-upgrade path end-to-end); optional AccountWelcome still deferred |
| P3 | Password-reset flow (forgot + reset pages, recovery email) | ✅ | live-tested (new pw works, old rejected) |
| P4 | Order/payment confirmation email (+ `Orders.confirmation_email_sent_at` migration, idempotent send) | ✅ | migration applied; live-tested (one email, webhook replay idempotent) |
| P5 | Admin "new story submission" notification (folds in story-submission-notifications.md) | ✅ | live-tested (delivered to ADMIN_NOTIFICATIONS_EMAIL) |
| P6 | Mailing list: `Subscribers` table, double opt-in, confirm/unsubscribe routes, wire /about + /contacts forms, admin subscribers view, Resend Audience sync | ✅ | migration applied; live-tested full round-trip incl. Audience sync |
| P7 | Production cutover (verified domain, prod hook URL/secret, audience id) — see CONCERNS T1/T2 | 🟡 | **T1 done** (domain `mildfire.dev` verified, `RESEND_FROM_EMAIL` set); **T2 done** (Audience created + `RESEND_AUDIENCE_ID` set); `ADMIN_NOTIFICATIONS_EMAIL` set. Remaining for prod: `NEXT_PUBLIC_BASE_URL`, prod hook URL/secret |

Per-phase sub-steps with acceptance checks are below. Tick the sub-boxes as you go; flip
the table status when a phase's boxes are all ✅.

---

## P0 — Foundations ✅

- [x] `src/lib/email/resend.ts` — singleton `new Resend(process.env.RESEND_API_KEY)` +
      `DEFAULT_FROM` + `SITE_URL` (from `NEXT_PUBLIC_BASE_URL`).
- [x] `src/lib/email/send.ts` — `sendEmail({ to, subject, react, from?, replyTo? })` →
      `resend.emails.send` with `react` (Resend v4 renders React Email directly). Returns the
      message id or throws; log + swallow at call sites that must not fail (e.g. order webhook).
- [x] `src/emails/_BaseLayout.tsx` — brand shell (ЧТИВО wordmark, palette inline, legal footer)
      + exported `ui` style primitives. All templates compose this.
- [x] Env vars added to `.env.example` (`RESEND_FROM_EMAIL`, `SEND_EMAIL_HOOK_SECRET`,
      `RESEND_AUDIENCE_ID`, tidied `ADMIN_NOTIFICATIONS_EMAIL`). `RESEND_API_KEY` /
      `ADMIN_NOTIFICATIONS_EMAIL` already in `.env`.
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [x] **Live acceptance (2026-06-13):** `node --env-file=.env scripts/test-email.mjs
      mildfire@gmail.com` → Resend `last_event: delivered` (msg `7d822b93…`), from the
      verified `no-reply@mildfire.dev`. (`scripts/test-email.mjs` is a throwaway dev aid;
      delete once the rest of the live-acceptance pass is done.)

## P1 — Auth Send-Email Hook ✅ (code; live test pending Supabase restart)

- [x] `src/app/api/auth/hooks/send-email/route.ts` — POST handler: verifies the
      Standard-Webhooks signature with `SEND_EMAIL_HOOK_SECRET` (`standardwebhooks@1.0.0`,
      strips the `v1,whsec_` prefix), parses `{ user, email_data }`, builds the
      `${SITE_URL}/auth/confirm?token_hash=…&type=…&next=…` link, switches on
      `email_action_type` (`recovery` → ResetPassword; `signup`/`email_change`/other →
      ConfirmSignup), sends, returns `{}`.
- [x] `src/emails/ConfirmSignup.tsx` (covers `signup` + `email_change`) and
      `src/emails/ResetPassword.tsx` (`recovery`).
- [x] `supabase/config.toml`: `[auth.hook.send_email]` enabled, uri
      `http://host.docker.internal:3000/api/auth/hooks/send-email`,
      `secrets = "env(SEND_EMAIL_HOOK_SECRET)"`. (Prod uri = live origin — T1.)
- [x] `src/app/(site)/auth/confirm/route.ts` — GET, `verifyOtp({ token_hash, type })`,
      sets session cookies on the redirect response, forwards to safe `next`.
- [x] `SEND_EMAIL_HOOK_SECRET` generated into local `.env`.
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [x] **Live acceptance (2026-06-13):** anon-upgrade registration routed through
      `/api/auth/hooks/send-email` and the email **delivered** via Resend to the verified
      domain. ⚠️ Found + fixed a bug: the hook sent to the empty `user.email` on
      `email_change`; GoTrue puts the address in `new_email`. Fixed in commit `274694e8`
      (recipient = `new_email || email`). Without the fix every registration 500s.

## P2 — Registration confirmation + soft-gate UX ✅ (code; live test pending Supabase restart)

- [x] `supabase/config.toml`: `[auth.email] enable_confirmations = true`.
- [x] `registerAction` (`src/lib/auth/actions.ts`): anon `updateUser({email,password})`
      (preserves UID/cart) → `email_change` confirm, session persists (soft gate), redirect
      `/profile`. Fresh `signUp` → no session → redirect `/auth/login?check_email=1`. Both
      branches commented.
- [x] `resendEmailConfirmationAction` — picks `email_change` vs `signup` from user state.
- [x] `EmailConfirmBanner` (`src/components/profile/EmailConfirmBanner/`) — shown in
      `profile/layout.tsx` when `user.new_email` (pending change) or a real account with no
      `email_confirmed_at`; resend button + toast.
- [x] Login page shows a "проверьте почту" notice on `?check_email=1`.
- [~] `AccountWelcome.tsx` — **deferred** (optional). Add later from `/auth/confirm` on first
      confirm if wanted.
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [x] **Live acceptance (2026-06-13, anon-upgrade path):** registered as anon →
      `email_change` confirm email delivered → soft-gate `/profile` with `EmailConfirmBanner`
      ("Мы отправили ссылку на …") → followed the link → DB shows `is_anonymous=f`,
      `email_confirmed_at` set, `email_change` cleared, UID preserved → banner gone, sidebar
      shows the authenticated "Выйти" state. (Required the `274694e8` hook fix above.)
- [ ] **Live acceptance — fresh `signUp` path:** not exercised via the browser (providers
      always create an anon session first, so the register page always takes the upgrade
      branch). Lower risk — `signUp` populates `user.email`, which the hook already handled.

## P3 — Password reset ✅

- [x] `src/app/(site)/auth/forgot-password/page.tsx` + `requestPasswordResetAction` calling
      `resetPasswordForEmail(email, { redirectTo: '${BASE_URL}/auth/reset-password' })`
      (recovery email rendered by the P1 hook). Always reports success (no account-existence leak).
- [x] `src/app/(site)/auth/reset-password/page.tsx` + `updatePasswordAction` →
      `updateUser({ password })` for the recovery session, redirect `/profile`.
- [x] "Забыли пароль?" link added to the login page. New pages reuse `../login/page.module.scss`.
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [x] **Live acceptance (2026-06-13):** forgot-password → "Сброс пароля — Чтиво" recovery
      email delivered via the hook → reset link → `/auth/reset-password` → set new password →
      redirected signed-in to `/profile`. Verified at the GoTrue token endpoint: the new
      password authenticates, the old one returns `invalid_credentials`.

## P4 — Order/payment confirmation email ✅ (code; migration not yet applied)

- [x] Migration `supabase/migrations/20260613120000_order_confirmation_email.sql` —
      `Orders.confirmation_email_sent_at` + SECURITY DEFINER `claim_order_confirmation_email`
      (atomic transition, returns true once) + `release_order_confirmation_email` (retry on
      send failure). Granted to `service_role` only. (RPC-based so no generated-types
      dependency — avoids editing `src/types/supabase.ts`.)
- [x] `src/emails/OrderConfirmation.tsx` — line items (+ box-set label, qty), total.
- [x] `src/lib/email/sendOrderConfirmation.ts` — claim → fetch order/items via admin client →
      recipient = `Orders.delivery_email` (fallback to account email via
      `auth.admin.getUserById`) → send. Best-effort (logs + swallows); releases claim on
      send failure.
- [x] Call sites: `result/route.ts` (webhook), `startCheckoutAction` + `resumeCheckoutAction`
      0₽ settles. (Deliberately NOT the recurring-charge path — renewals don't fire the
      one-time purchase confirmation.)
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [ ] **Apply migration (manual):** `supabase migration up` (additive/safe) then regenerate
      `src/types/supabase.ts`. Until applied, the claim RPC errors and the email silently
      no-ops (payment flow unaffected).
- [x] **Live acceptance (2026-06-13):** anon digital purchase (order №19, 100₽, delivery
      email entered) via the mock gateway delivered exactly one "Заказ №19 оплачен" email;
      `Orders.confirmation_email_sent_at` set, status `paid`. Replaying the gateway ResultURL
      notification (re-POST to `/api/payments/mock/pay`, HTTP 303, order re-marked paid
      idempotently) sent nothing further — still exactly one email in Resend. Claim-then-send
      idempotency confirmed.
      ⚠️ Note (not email-related): `/checkout` `router.replace('/cart')` fires on a **hard**
      load/refresh before the cart query hydrates (`items` briefly `[]`), bouncing the user to
      `/cart`. Harmless via the normal client-nav flow; worth a guard (wait for cart load)
      pre-launch.

## P5 — Admin: new story submission ✅

- [x] `src/emails/AdminStorySubmission.tsx` (author, cover letter, storage path).
- [x] `src/lib/stories/actions.ts` `notifyStorySubmissionAction(meta)` → send to
      `ADMIN_NOTIFICATIONS_EMAIL` (best-effort, server action).
- [x] Called from `StorySubmitModal` after a successful upload (fire-and-forget — the upload
      runs in the browser, so the notify is a Server Action, not inside `submitStorySubmission`).
- [x] Deleted `docs/plans/story-submission-notifications.md` (now shipped here).
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [x] **Live acceptance (2026-06-13):** submitted a story via `/suggest-story-to-rd`
      (StorySubmitModal, fb2 upload) → "Новый рассказ на рассмотрение — Тестовый Автор P5"
      delivered to `ADMIN_NOTIFICATIONS_EMAIL` (`mildfire@gmail.com`). Note: the `.env` line had
      a space before `=` and is read at server startup, so it required normalizing the line +
      a dev-server restart.

## P6 — Mailing list (scaffold, double opt-in) ✅ (code; migration not yet applied)

- [x] Migration `supabase/migrations/20260613130000_subscribers.sql` — `Subscribers` table
      (`email text unique` normalized lower in SQL; nullable `user_id`; status check;
      `confirm_token`/`unsubscribe_token`; `resend_contact_id`). RLS on, no policies. All
      access via SECURITY DEFINER fns granted to `service_role`: `subscribe_newsletter`,
      `confirm_newsletter`, `unsubscribe_newsletter`, `set_subscriber_resend_contact`.
- [x] `src/lib/subscribers/actions.ts` `subscribeAction({email, source})` → `subscribe_newsletter`
      RPC → send `NewsletterConfirm` (double opt-in). `already` short-circuit for active addresses.
- [x] `src/emails/NewsletterConfirm.tsx`. (NewsletterWelcome optional — not built.)
- [x] `src/lib/email/audience.ts` — `addToAudience`/`removeFromAudience` (no-op until
      `RESEND_AUDIENCE_ID` set; failures swallowed).
- [x] `/newsletter/confirm/route.ts` → activate + add to Audience + store contact id → redirect
      `/newsletter?status=confirmed`. `/newsletter/unsubscribe/route.ts` → unsubscribe + remove
      from Audience. `/newsletter/page.tsx` renders the result message.
- [x] Wired **/about `StayWithUsForm`** and **/contacts `NewsletterForm`** to `subscribeAction`
      (kept consent copy; show "проверьте почту").
- [x] Admin: `/admin/subscribers` read-only list (`src/api/admin/subscribers`, `AdminPageHeader`
      + `StatusBadge`), nav entry under «Редакция» (no count chip — avoids counts plumbing).
- [x] `npx eslint` + `npx tsc --noEmit` clean.
- [ ] **Apply migration (manual):** `supabase migration up`. Until then the subscribe RPCs error
      (subscribe surfaces a friendly failure; nothing crashes).
- [x] **Live acceptance (2026-06-13):** subscribed on /about → `pending` row + "Подтвердите
      подписку" delivered → confirm link (307 → `/newsletter?status=confirmed`) flipped to
      `active`, stored `resend_contact_id`, and added the address to the Resend Audience.
      Unsubscribe link (307 → `/newsletter?status=unsubscribed`) flipped to `unsubscribed` and
      removed it from the Audience (back to 0 contacts). Audience sync (T2) confirmed working.

## P7 — Production cutover (tracked, not dev work)

- [ ] **T1** Verify the real sending domain in Resend (SPF/DKIM/DMARC DNS), set
      `RESEND_FROM_EMAIL` to e.g. `no-reply@<domain>`, point the hook `uri` at the live origin,
      set `SEND_EMAIL_HOOK_SECRET` in prod.
- [ ] **T2** Create the Resend Audience, set `RESEND_AUDIENCE_ID` in prod.
- [ ] Mirror to `docs/CONCERNS.md` (relates to **P2** payments go-live + **G2** email delivery).

---

## Notes / gotchas

- **`@react-email/render` vs Resend `react`**: Resend v4 accepts a `react` prop and renders
  server-side — prefer that over manual `render()`.
- **Local hook reachability**: GoTrue runs in Docker; it reaches the host dev server via
  `host.docker.internal`. Confirm the container can hit port 3000.
- **Anon-upgrade confirmation is the trickiest path** — `updateUser({email})` uses the
  `email_change` action type and `user.new_email`, not `signup`/`email_confirmed_at`. The
  banner + resend logic must handle both shapes.
- **Idempotency everywhere a webhook can replay** (order confirmation) — claim-then-send.
- **Test mode caveat**: until T1, Resend will only deliver to the account owner's address;
  emails to other addresses are accepted but not delivered. Don't mistake that for a bug.
- **Resolves** the email half of `docs/CONCERNS.md` **G2** once P0–P5 ship.
