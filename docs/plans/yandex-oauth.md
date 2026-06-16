# Yandex OAuth (custom integration) — plan & tracker

**Status:** 📋 Not started (plan only) · created 2026-06-16
**Owner:** —
**Scope of this doc:** Yandex login. VK reuses the same pattern (separate task); Telegram is a different (widget) flow — out of scope here, noted at the end.

> Resume note: nothing has been built yet. This doc is self-contained — an agent
> picking it up cold should be able to implement Yandex login end-to-end from
> here. Tick the **Tracker** as you go and keep the **Decisions** section current.

---

## 1. Why this is a custom integration (not a config toggle like Google)

Google was a built-in GoTrue provider — we just set `GOTRUE_EXTERNAL_GOOGLE_*`
(see `docs/deployment` history + `deploy/production/docker-compose.yml` auth
service). **Yandex is NOT a built-in GoTrue provider.** The GoTrue provider list
is: apple, azure, bitbucket, discord, facebook, figma, github, gitlab, google,
keycloak, linkedin_oidc, notion, slack, spotify, twitch, twitter, workos, zoom.

Supabase's "Custom OAuth/OIDC providers" feature requires a true **OIDC**
provider (issues an `id_token`). **Yandex is plain OAuth2** — you exchange a code
for an access token and read the profile from `login.yandex.ru/info`; there is no
standard `id_token`. So neither the built-in path nor the custom-OIDC path fits.

**Therefore:** implement the OAuth flow ourselves in app route handlers, then mint
a real GoTrue session for the resolved user via the admin API. This mirrors what
GoTrue does internally for Google.

## 2. Reference implementation to mirror (Google)

The Google flow is the template. Read these before starting:

- `src/app/api/auth/google/route.ts` — initiate: builds the provider URL, stashes
  the anon id in `PENDING_ANON_COOKIE`, redirects. (Note the public-origin URL
  rewrite + `SITE_ORIGIN` for redirects — see §7 gotchas, we hit these.)
- `src/app/(site)/auth/callback/route.ts` — the return leg: exchanges the code,
  **sets session cookies directly on the redirect response** (Route Handler
  `cookies().set()` isn't reliably preserved across a redirect), then runs the
  anon→real migration via the `migrate_anonymous_user` RPC, clears the pending
  cookie, redirects to `next`. **Copy this cookie + migration handling exactly.**
- `src/lib/supabase/server.ts` — `createClient()` (cookie client, `encode:
  'tokens-only'`, `cookieOptions.name: SUPABASE_AUTH_COOKIE_NAME`) and
  `createAdminClient()` (service-role).
- `src/lib/supabase/authCookie.ts` — `SUPABASE_AUTH_COOKIE_NAME` (must match the
  browser cookie; the server talks to internal kong, so the name is pinned).
- `src/lib/siteUrl.ts` — `SITE_ORIGIN` (use for ALL redirects; never `request.url`
  / `request.nextUrl.origin`, which resolve to `0.0.0.0:3000` behind the tunnel).
- `src/lib/profile/constants.ts` — `PENDING_ANON_COOKIE = 'sb-pending-anon-id'`.
- `src/lib/auth/actions.ts` — `migrateAnonymousUserAction` / the `migrate_anonymous_user`
  RPC call shape (the callback calls the RPC directly, not the action).

## 3. The flow

```
[Войти → Яндекс]  window.location.assign('/api/auth/yandex')
  │
  ▼
GET /api/auth/yandex                         (route handler)
  - read current user; if anonymous → set PENDING_ANON_COOKIE = anon uid
  - generate CSRF `state` (random), set it in an httpOnly cookie
  - 302 → https://oauth.yandex.ru/authorize
            ?response_type=code
            &client_id=<YANDEX_CLIENT_ID>
            &redirect_uri=<SITE_ORIGIN>/api/auth/yandex/callback
            &state=<state>
  │
  ▼  (user consents at Yandex)
GET /api/auth/yandex/callback?code=…&state=…  (route handler)
  - verify `state` matches the cookie (CSRF); clear it
  - POST https://oauth.yandex.ru/token  (grant_type=authorization_code,
        code, client_id, client_secret)  → { access_token }
  - GET https://login.yandex.ru/info?format=json
        (header: Authorization: OAuth <access_token>)
        → { id, default_email, login, real_name, first_name, last_name }
  - resolve email (default_email). If absent → error redirect (account needs email)
  - PROVISION user (admin/service-role): find-or-create by email (§5)
  - MINT session (§6): admin.generateLink({type:'magiclink', email})
        → token_hash → verifyOtp({type, token_hash})  (cookie client)
        → session cookies set on the redirect response
  - ANON MIGRATION: if PENDING_ANON_COOKIE present and != resolved uid →
        rpc('migrate_anonymous_user', { from_user_id, to_user_id }); clear cookie
  - 302 → <SITE_ORIGIN>/profile?email_confirmed=1   (reuse the success modal)
```

Net chain mirrors Google, except WE do the token-exchange + userinfo + session
mint instead of GoTrue.

## 4. Prerequisites (provided by the operator, NOT code)

- [ ] **Register a Yandex OAuth app** at https://oauth.yandex.com:
  - Platform: **Web services**.
  - **Redirect URI / Callback:** `https://bookstore-app.mildfire.dev/api/auth/yandex/callback`
  - **Scopes/permissions:** `login:email` + `login:info` (email + profile).
  - Obtain **Client ID** + **Client Secret**.
- [ ] Provide creds to set in prod `.env` (see §9 env vars).

## 5. User provisioning (service-role admin client)

Goal: resolve a single Supabase user for the Yandex identity, keyed by the
Yandex-verified email.

- Use `createAdminClient()` (service role).
- Find existing user by email. (List/filter via the admin API — confirm the exact
  call available in our supabase-js version: `admin.listUsers` + filter, or a
  direct `auth.users` lookup with the service role through PostgREST is NOT
  possible — `auth` schema isn't exposed — so use the **GoTrue admin API**.)
- If not found: `admin.createUser({ email, email_confirm: true, user_metadata:
  { full_name, provider: 'yandex', yandex_id } })`. `email_confirm: true` because
  Yandex emails are verified — we trust them (see §8 decision).
- If found: optionally update `user_metadata` with the yandex_id (idempotent link).

**Account-linking decision (LOCK BEFORE BUILDING — see §8):** what to do when the
email already exists under a different provider (e.g. password or Google).

## 6. Session minting (the key technical step)

GoTrue admin can't directly hand back an access/refresh token, so use the
generate-link → verify-OTP trick (server-side, no email sent):

1. `const { data } = await admin.auth.admin.generateLink({ type: 'magiclink', email })`
   → returns `data.properties.hashed_token` (a.k.a. the OTP `token_hash`).
   - ⚠️ **Validate during build:** confirm `generateLink` does NOT trigger the
     send-email hook (it shouldn't — it returns the link for you to send). If it
     does, suppress/accept it.
2. With a **cookie client** (`createServerClient`, same cookie config as
   `/auth/callback`): `verifyOtp({ type: 'magiclink', token_hash })` (or `type:
   'email'` — verify which the version expects). This establishes the session and
   the cookie adapter writes the tokens onto the **redirect response** object.
3. Return that response (302 → `/profile?email_confirmed=1`).

> Risk: this is the least-certain part. If `generateLink`+`verifyOtp` proves
> unreliable in our GoTrue v2.188.1, the fallback is to mint the session by
> calling the GoTrue **`/token` admin path** or, last resort, issuing our own
> signed access+refresh — but that bypasses GoTrue session management and is
> discouraged. Prototype §6 FIRST (spike) before wiring the full flow.

## 7. Gotchas already learned this project (apply them here)

- **Always build redirects from `SITE_ORIGIN`** (not `request.url` /
  `request.nextUrl.origin`) — behind the Cloudflare tunnel those resolve to the
  container bind address `0.0.0.0:3000`.
- The server cookie clients talk to **internal kong**; cookie name MUST be pinned
  to `SUPABASE_AUTH_COOKIE_NAME` (already handled by `createClient`; if you build
  a bespoke `createServerClient` here, pass `cookieOptions: { name:
  SUPABASE_AUTH_COOKIE_NAME }`).
- Any URL we hand the **browser** must be the public origin; any URL we call
  **server-side** can use internal kong. (Yandex endpoints are external, called
  server-side — fine.)
- `encode: 'tokens-only'` on the cookie adapter (match the rest of the app).

## 8. Security & policy

- [ ] **CSRF:** random `state`, stored httpOnly cookie, verified on callback.
- [ ] **Email trust:** Yandex `default_email` is account-verified → `email_confirm:
  true` is acceptable. Document this assumption.
- [ ] **Account-linking policy (DECISION NEEDED):**
  - Option A (simplest): match by email → sign into the existing account
    (implicitly links Yandex to whatever account owns that email). Risk: email
    takeover if Yandex email isn't truly verified (it is, for default_email).
  - Option B: only auto-create; if email exists under another provider, send to
    login with a "use your original method / link in cabinet" message.
  - **Recommendation:** Option A (verified email), matching how Supabase links
    providers by email by default. Confirm with operator.
- [ ] **Secrets:** `YANDEX_CLIENT_SECRET` server-only env, never `NEXT_PUBLIC_*`,
  never committed. Set in `/opt/chtivo/.env` (chmod 600), wired via compose.
- [ ] **Open redirect:** `next` param (if added) must be validated like
  `/auth/callback` (`startsWith('/') && !startsWith('//')`).

## 9. Env vars

`.env` (prod, gitignored) + `deploy/production/.env.example` (documented, no
secret) + compose `app` service env:

```
YANDEX_ENABLED=true
YANDEX_CLIENT_ID=<from Yandex app>
YANDEX_CLIENT_SECRET=<from Yandex app>
```

These are read by our **app** route handlers (server-side), NOT by GoTrue (GoTrue
has no Yandex provider). So they go on the `app` service env, not `auth`.

## 10. Files to create / change

| File | Change |
|---|---|
| `src/app/api/auth/yandex/route.ts` | NEW — initiate (state cookie, anon stash, redirect to Yandex authorize) |
| `src/app/api/auth/yandex/callback/route.ts` | NEW — state verify, token exchange, userinfo, provision, session mint, anon migrate, redirect |
| `src/lib/auth/yandex.ts` (or similar) | NEW — small helpers: build authorize URL, exchange code, fetch userinfo (typed) |
| `src/components/profile/LoginModal/LoginModal.tsx` | wire the Yandex button: `handleStub('Яндекс')` → `handleYandex` (`window.location.assign('/api/auth/yandex')`); remove the «Скоро» state for Yandex only |
| `src/components/profile/ProfileAuthSlot/ProfileAuthSlot.tsx` | same Yandex button wiring (it has its own OAuth buttons) |
| `src/components/profile/AnonRecoveryModal/AnonRecoveryModal.tsx` | same (its `handleStub('Яндекс')` → real) |
| `deploy/production/docker-compose.yml` | add `YANDEX_*` to the `app` service env |
| `deploy/production/.env.example` | document `YANDEX_ENABLED/CLIENT_ID/SECRET` |
| `/opt/chtivo/.env` (VPS, manual) | set the real creds; recreate `app` |

(`YandexIcon` is already imported in `LoginModal.tsx` — only the handler/disabled
state changes.)

## 11. Testing / acceptance

- [ ] Spike §6 in isolation: confirm `generateLink`+`verifyOtp` yields a working
      session for an arbitrary email on prod GoTrue (no email sent).
- [ ] Fresh (no session) → Yandex → consent → land in `/profile` signed in; row in
      `auth.users` with the email + yandex metadata.
- [ ] Anonymous → Yandex → cart/orders migrated to the resolved user (verify the
      anon row is gone and Cart/Orders moved — same as Google).
- [ ] Existing email (per the §8 decision) behaves correctly.
- [ ] CSRF: tampered/missing `state` → rejected.
- [ ] `redirect_uri_mismatch` / Yandex errors → graceful redirect to `/auth/login`
      with a message (mirror the Google error path).
- [ ] Build clean (keyless build, as in CI); deploy via `production` branch;
      sync compose + `.env` to the VPS (infra isn't auto-deployed — see
      `deploy/production/README.md` "Deploy model").

## 12. Tracker

- [ ] **P0 — Yandex OAuth app registered** (operator): web app, callback
      `https://bookstore-app.mildfire.dev/api/auth/yandex/callback`, scopes
      `login:email login:info`, creds obtained.
- [ ] **P1 — Session-mint spike** (§6): prove `generateLink`+`verifyOtp` works on
      prod GoTrue v2.188.1 without sending email. ← do this first; it's the risk.
- [ ] **P2 — Account-linking decision** (§8) locked with operator.
- [ ] **P3 — Helpers** (`src/lib/auth/yandex.ts`): authorize URL, token exchange,
      userinfo (typed, error-handled).
- [ ] **P4 — `/api/auth/yandex` route** (initiate + state + anon stash).
- [ ] **P5 — `/api/auth/yandex/callback` route** (verify → exchange → userinfo →
      provision → session → migrate → redirect). Reuse `/auth/callback` cookie +
      migration handling verbatim.
- [ ] **P6 — Env wiring**: compose `app` env + `.env.example` + prod `.env` +
      recreate `app`.
- [ ] **P7 — UI**: wire the Yandex button in `LoginModal`, `ProfileAuthSlot`,
      `AnonRecoveryModal` (remove «Скоро» for Yandex only).
- [ ] **P8 — Build + deploy + verify** (§11 acceptance), incl. anon migration.
- [ ] **P9 — Docs**: update this tracker + note Yandex live in deployment tracker.

## 13. Decisions (keep current)

- Custom app-level OAuth (GoTrue has no Yandex provider). — locked, §1.
- Session minted via `generateLink`(magiclink)+`verifyOtp`. — proposed, validate in P1.
- Account-linking: **TBD** (Option A recommended). — §8, needs operator.
- Creds on the **app** service env (not auth). — locked, §9.

## 14. VK & Telegram (follow-on, not this doc)

- **VK** (`id.vk.com` / VK ID): same custom-OAuth2 pattern as Yandex — once Yandex
  works, clone the routes/helpers with VK endpoints + a `VK_*` env set.
- **Telegram:** NOT OAuth — uses the **Telegram Login Widget**, which posts a
  signed payload (HMAC with the bot token) to a callback. Different flow
  (widget script + signature verification + same user-provision/session-mint
  tail). Separate plan when prioritized.
