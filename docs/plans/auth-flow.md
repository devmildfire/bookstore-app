# Authentication Flow — Anonymous → OAuth / Email Migration

**Status**: Shipped (2026-05-21)
**Commits**: `ab33ee5` (cleanup), `65e2a98` (feature)
**Owners**: this doc lives with the code; if you change `signInWithGoogleAction`,
`/auth/callback`, or `migrate_anonymous_user`, update this file too.

---

## Goal

Every visitor gets an anonymous Supabase session on first visit (see
`src/app/providers.tsx` → `supabase.auth.signInAnonymously()`). They can
browse, fill a cart, and even complete a purchase while anonymous.

When they later sign in — Google OAuth, email/password register, or
email/password login — their data must follow them onto the resolved
authenticated user with:

- **no orphaned rows** (Cart, Orders, Profile, CartPromo all reachable
  by RLS after sign-in),
- **no duplicate user IDs** (no zombie anon row left behind),
- **no "trap" states** where a returning user on a new device cannot sign
  in because their identity is "already linked elsewhere."

## Scope

In scope:
- anon → Google OAuth (`signInWithGoogleAction`)
- anon → email register (`registerAction`)
- anon → email login (`loginAction`)
- multi-device returning user (anon on Device B, real account exists from
  Device A)

Out of scope:
- Passkey, magic link, other OAuth providers — the same dispatch will work,
  but only Google is exercised today.
- Merging two real authenticated users — impossible by design.
- A logged-in real user adding a second sign-in method (would require
  `linkIdentity`, which we don't expose). Separate UX, future work.

---

## End-state behavior

| Scenario | Pre-signin UID | Post-signin UID | What moves | Anon row |
|---|---|---|---|---|
| Brand-new visitor → Google | anon `AAA` | new `BBB` (created by GoTrue) | Cart/Orders/Profile from `AAA` → `BBB` | deleted |
| Brand-new visitor → email register | anon `AAA` | same `AAA` (in-place via `updateUser`) | nothing — already attached | n/a |
| Returning user, same device, anon cart → Google | anon `CCC` | existing `BBB` | Cart/Orders/Profile from `CCC` → `BBB` (with merge) | deleted |
| Returning user, **new device** → Google | anon `DDD` | existing `BBB` | Cart/Orders/Profile from `DDD` → `BBB` (often empty) | deleted |
| Returning user, anon cart → email login | anon `EEE` | existing `BBB` | Cart/Orders/Profile from `EEE` → `BBB` (with merge) | deleted |
| Logged out, browses anon, signs back in | new anon `FFF` | existing `BBB` | as above | deleted |

In every case the final state is: **one user row, no orphan, the cart and
orders the user accumulated as anonymous are accessible to them after sign-in.**

---

## Locked design decisions

| Decision | Answer | Rationale |
|---|---|---|
| Anon → Google strategy | Always `signInWithOAuth` + post-callback migration | `linkIdentity` traps multi-device returning users (see next section). |
| Anon → email register | In-place upgrade via `updateUser({email,password})` | Same UID preserved; no migration needed. Pre-existed; unchanged. |
| Anon → email login | `signInWithPassword` + `migrate_anonymous_user` | Mirrors the OAuth path; gives email-login the same Orders-preservation as OAuth. |
| Migration mechanism | One PL/pgSQL `SECURITY DEFINER` RPC, atomic | Avoids partial-state failures across many round-trips. |
| Cookie carrying anon UID across OAuth round-trip | `sb-pending-anon-id`, HttpOnly, SameSite=lax, 10 min TTL | Survives the third-party redirect; not readable from JS; auto-expires. |
| Profile-row merge policy | Target wins on conflict; drop anon's | The resolved (real) user is more "canonical." Field-level merge was rejected as overkill. |
| Migration failure mode | Log + continue; user still completes sign-in | We don't punish a successful sign-in for a migration bug. Best-effort matches the existing pattern in `loginAction`. |
| Identity-collision handling | Folded into migration | The old `linkIdentity` model needed a dedicated "this Google account is already taken" branch. With `signInWithOAuth`, that case becomes "log into the existing user + migrate" — uniform. |

---

## Why NOT `linkIdentity` — the design exploration

`supabase.auth.linkIdentity({provider:'google'})` keeps the anon UID and
adds Google as a sibling identity in `auth.identities`. It looks like the
textbook "in-place upgrade" — same UID, no migration, perfect audit trail.
We tried it first.

**The trap**: `linkIdentity` refuses if the Google identity is already
attached to *any* `auth.users` row. The multi-device case breaks it:

1. User on Device A: anon `AAA` signs in with Google. `AAA` gets
   `{anonymous, google}` identities — perfect.
2. Same user on Device B: fresh anon `BBB` on first visit. They click
   "Sign in with Google" with the same Google account. **`linkIdentity`
   fails** — Google is already linked to `AAA`.
3. The user has no password — they only ever used Google to sign in. The
   `/auth/login` page only exposes email + password fields. They are
   **trapped** on Device B with no way to reach their account.

Adding a "Sign in with Google" button to `/auth/login` would not help —
it would re-enter the same `linkIdentity` flow and fail again. The only
real escape would be a "manual unlink" UI, which is more code than the
migration we now own.

`signInWithOAuth` does not have this restriction — it always resolves
Google to whatever `auth.users` row Google maps to (creating one if none).
The cost is the multi-table migration. We chose to pay it.

Consequence: `enable_manual_linking` stays `false` in
`supabase/config.toml`. We do not call `linkIdentity` anywhere.

References:
- https://supabase.com/docs/guides/auth/auth-anonymous
- https://supabase.com/docs/reference/javascript/auth-linkidentity

---

## Architecture

### Code map

```
src/lib/profile/
├── actions.ts                  signInWithGoogleAction — always signInWithOAuth;
│                               stashes anon UID in PENDING_ANON_COOKIE when anon
└── constants.ts                PENDING_ANON_COOKIE = 'sb-pending-anon-id'
                                (lives outside actions.ts because 'use server'
                                files may only export async functions)

src/lib/auth/
└── actions.ts                  loginAction / registerAction;
                                migrateAnonymousUserAction wraps the RPC

src/app/auth/callback/
└── route.ts                    Server-side PKCE exchange.
                                Reads PENDING_ANON_COOKIE, calls
                                migrate_anonymous_user if UIDs differ,
                                clears the cookie, redirects to next.

src/app/auth/login/
└── page.tsx                    Renders ?auth_error=… query param if present
                                (GoTrue OAuth pre-exchange errors land here)

supabase/migrations/
├── 20260505100000_cart_user_isolation.sql   Cart RLS + composite PK + migrate_cart
│                                            (RPC superseded but kept for now)
└── 20260521130000_migrate_anonymous_user.sql   The current RPC

src/proxy.ts                    Refreshes the Supabase session on every request;
                                gates /admin; sets the bookstore_cart_id cookie
```

### Flow diagram — anon → Google (success path)

```
[browser: /profile]
  │ click "Sign in with Google"
  ▼
[Server Action: signInWithGoogleAction(origin)]
  │ getUser() → {id: AAA, is_anonymous: true}
  │ signInWithOAuth({
  │   provider: 'google',
  │   options: { redirectTo: origin+'/auth/callback?next=/profile',
  │              skipBrowserRedirect: true },
  │ }) → {url: 'https://accounts.google.com/o/oauth2/...'}
  │ cookies().set('sb-pending-anon-id', 'AAA', {HttpOnly, lax, MaxAge: 600})
  │ return {status:'ok', url}
  ▼
[client: window.location.href = url]
  ▼
[accounts.google.com — user authorizes]
  ▼
[GET /auth/callback?code=<pkce>&next=/profile]
  │ exchangeCodeForSession(code) → resolves user BBB (new or existing)
  │ read cookie sb-pending-anon-id → 'AAA'
  │ if AAA !== BBB:
  │   rpc('migrate_anonymous_user', {from: AAA, to: BBB})
  │     ├── merges Cart (sum quantities for shared rows, move rest)
  │     ├── UPDATE "Orders" SET user_id = BBB WHERE user_id = AAA
  │     ├── CartPromo: target wins on conflict
  │     ├── Profiles:  target wins on conflict
  │     └── DELETE FROM auth.users WHERE id = AAA AND is_anonymous = true
  │ response.cookies.set('sb-pending-anon-id', '', {MaxAge: 0})
  │ NextResponse.redirect('/profile')
  ▼
[browser: /profile, session belongs to BBB]
```

### `migrate_anonymous_user` RPC contract

Signature: `migrate_anonymous_user(from_user_id uuid, to_user_id uuid) RETURNS void`

Lives in `supabase/migrations/20260521130000_migrate_anonymous_user.sql`.

**Security model**:
- `SECURITY DEFINER` — runs as DB owner, bypasses RLS so it can move rows
  across `user_id` values and delete from `auth.users`.
- Caller must satisfy `to_user_id = auth.uid()`. A hostile caller cannot
  migrate someone else's data onto themselves.
- `from_user_id` must reference a row with `is_anonymous = true`. A
  hostile caller cannot collapse a real user's data into theirs.
- `EXECUTE` granted to `authenticated` only.

**Transaction shape** (single PL/pgSQL `BEGIN…END`, atomic):

1. Validate `to_user_id = auth.uid()`.
2. No-op if `from = to` (defensive).
3. Validate `from_user_id` is anonymous.
4. **Cart** — UPDATE-merge quantities for shared `(user_id, id)` rows;
   UPDATE-move remaining rows; DELETE residual.
5. **Orders** — `UPDATE "Orders" SET user_id = to_user_id WHERE user_id = from_user_id`.
   No PK conflict (multi-row, surrogate PK).
6. **CartPromo** — target wins: DELETE anon's row if target has one,
   else UPDATE.
7. **Profiles** — target wins: DELETE anon's row if target has one,
   else UPDATE.
8. **`DELETE FROM auth.users WHERE id = from_user_id AND is_anonymous = true`**.
   All FK-dependent rows have been moved or removed above; CASCADE is a
   no-op.

If any step raises, the whole transaction rolls back — no partial state.

### Why touch `auth.users` directly

The RPC deletes from `auth.users`. This is unusual; most app code never
touches the auth schema. We do it because:

1. There's no public-facing "delete an anonymous user" Supabase API.
2. We need the delete atomic with the data migration — leaving a
   half-deleted state is worse than not migrating at all.

The `SECURITY DEFINER` + `is_anonymous = true` guard limits the blast
radius: hostile callers cannot use this RPC to delete real users.

### Cookie semantics — `sb-pending-anon-id`

| Property | Value | Why |
|---|---|---|
| Name | `sb-pending-anon-id` | Namespaced under `sb-` for readability |
| Value | The anon UID (UUID string) | Passed as `from_user_id` in the migration |
| `HttpOnly` | `true` | Browser JS cannot read it; only `/auth/callback` |
| `SameSite` | `lax` | Survives the OAuth top-level redirect through Google |
| `Secure` | `true` in production (`NODE_ENV === 'production'`) | Only sent over HTTPS in prod |
| `Path` | `/` | Sent to `/auth/callback` |
| `Max-Age` | 600 (10 min) | Long enough for any OAuth round-trip; short enough that an abandoned flow doesn't linger |
| Set when | User is anonymous **and** OAuth URL successfully returned | If user is already authed, no anon row to migrate, so we skip |
| Cleared when | Callback finishes (success, error, or skip) | Empty value + `Max-Age=0` |

---

## Local dev setup

1. Run local Supabase from the project root:
   ```bash
   cd ~/repos/chtivo-next && supabase start
   ```
2. `.env` (already configured in the repo, but for reference):
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<dev OAuth client id>
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<dev OAuth client secret>
   ```
3. Google OAuth client (Google Cloud Console → APIs & Services → Credentials):
   - **Authorized JavaScript origins**: `http://localhost:3000`
   - **Authorized redirect URIs**: `http://localhost:54321/auth/v1/callback`
4. `supabase/config.toml` already sets:
   - `[auth].site_url = "http://localhost:3000"`
   - `[auth].additional_redirect_urls` includes localhost on ports 3000.
   - `[auth.external.google].enabled = true` with `client_id`/`secret`
     reading from the env vars and
     `redirect_uri = "http://localhost:54321/auth/v1/callback"`.
   - `[auth].enable_manual_linking = false` — **do not flip to true**;
     we do not use `linkIdentity`.
5. Apply migrations:
   ```bash
   cd ~/repos/chtivo-next && supabase migration up
   ```
6. Regenerate Supabase types (see `CLAUDE.md` for the canonical command).

### Smoke test (local)

```bash
# Get the current anon UID
docker exec supabase_db_chtivo-next psql -U postgres -d postgres -c \
  "SELECT id FROM auth.users WHERE is_anonymous = true ORDER BY created_at DESC LIMIT 1;"
```

1. Clear cookies for `localhost:3000`. Reload → new anon created.
2. Note the new anon UID with the query above.
3. Click "Sign in with Google" → land at `/profile` signed in.
4. Verify the anon UID is gone:
   ```sql
   SELECT id, is_anonymous FROM auth.users WHERE id = '<anon-uid-from-step-2>';
   -- expected: 0 rows
   ```
5. Verify the post-signin user has any cart you added pre-signin:
   ```sql
   SELECT * FROM "Cart" WHERE user_id = '<your-resolved-uid>';
   ```

---

## Production deployment

This section is the checklist when promoting from local to the self-hosted
VPS (currently `<vps-ip>` per `CLAUDE.md`).

### 1. Google Cloud Console (OAuth client)

Use a **separate** OAuth 2.0 Client ID for production — don't share
secrets with dev.

In Google Cloud Console → APIs & Services → Credentials → the prod client:

- **Authorized JavaScript origins**: add `https://<app-public-host>`
- **Authorized redirect URIs**: add `https://<supabase-public-host>/auth/v1/callback`

Both **must be HTTPS**. Google rejects `http` for non-localhost.

### 2. Supabase auth config (production)

Edit `supabase/config.toml` for the production deployment, or set
equivalents via the Dashboard if using hosted Supabase:

```toml
[auth]
site_url = "https://<app-public-host>"
additional_redirect_urls = [
  "https://<app-public-host>",
  "https://<app-public-host>/**",
]
enable_manual_linking = false        # leave false — we do not use linkIdentity

[auth.external.google]
enabled      = true
client_id    = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
secret       = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
redirect_uri = "https://<supabase-public-host>/auth/v1/callback"
```

### 3. Production env vars

**Application (Next.js)** — wherever the app process runs:

| Var | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<supabase-public-host>` — the **public** URL. Used in browser cookies and image URLs. Never an internal Docker hostname. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key (rotate from dev). |
| `SUPABASE_SERVICE_ROLE_KEY` | Production service-role key. Server-only — never exposed to the browser. |
| `NODE_ENV` | `production` — gates the `Secure` flag on `sb-pending-anon-id`. |

**GoTrue / Supabase auth container** — set in docker-compose or hosting env:

| Var | Notes |
|---|---|
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | Production OAuth client ID. |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Production OAuth client secret. |
| `GOTRUE_JWT_SECRET` | Rotate from dev. |
| `GOTRUE_SITE_URL` | Must equal `[auth].site_url`. |
| `GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED` | `true` — required for `signInAnonymously`. |
| `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED` | `false` — leave unset or false. |

### 4. Reverse proxy (nginx / Caddy)

If self-hosting Supabase behind a proxy on the same VPS:

- Proxy `/auth/v1/*` to the GoTrue container.
- Proxy `/storage/v1/*` to the Storage container (already needed for
  cover images — see `CLAUDE.md § Cover images`).
- Preserve `Set-Cookie` response headers. The Supabase session cookies and
  our `sb-pending-anon-id` cookie both round-trip through the proxy.
- Preserve `Host` request header so GoTrue computes correct redirect URLs.

### 5. Apply the database migration

The production DB needs `20260521130000_migrate_anonymous_user.sql`:

```bash
# Option A: supabase CLI against the prod DB
supabase db push                              # if using `supabase link`-ed project
supabase migration up --db-url <prod-url>     # direct URL

# Option B: psql directly
psql <prod-url> -f supabase/migrations/20260521130000_migrate_anonymous_user.sql
```

After applying, regenerate Supabase types from the prod DB so the codebase
picks up the new RPC signature (see `CLAUDE.md § Regenerate Supabase types`).

### 6. HTTPS end-to-end

OAuth in production requires HTTPS on every leg. The flow will silently
break if any of these is `http`:

- the app origin (`NEXT_PUBLIC_SUPABASE_URL` and the redirect target)
- the Supabase auth API origin (Google's redirect URI)
- the cookies marked `Secure` (not sent over `http`)

### 7. Production smoke test

1. Open the production site in an incognito window.
2. Verify an anon session was created — `Application → Cookies` should
   show `sb-<project-ref>-auth-token` and `bookstore_cart_id`.
3. Add an item to the cart.
4. Note the current anon UID against the production DB:
   ```sql
   SELECT id, created_at FROM auth.users
   WHERE is_anonymous = true ORDER BY created_at DESC LIMIT 1;
   ```
5. Click "Sign in with Google" → expect redirect to `/profile`, signed in.
6. Verify migration ran:
   ```sql
   -- Anon row should be gone
   SELECT count(*) FROM auth.users WHERE id = '<anon-uid-from-step-4>';

   -- Resolved user should own the cart item from step 3
   SELECT * FROM "Cart" WHERE user_id = '<your-resolved-uid>';
   ```

---

## Operational concerns

### Anon row hygiene

Every visit creates an anon row. The migration deletes only rows that go
through OAuth or email-login. Abandoned anon sessions accumulate.

This is **not** a correctness issue (RLS keeps them inert), but it bloats
`auth.users`. Recommended hygiene (run as cron or one-off):

```sql
-- Preview
SELECT count(*) FROM auth.users
WHERE is_anonymous = true
  AND last_sign_in_at < now() - interval '30 days';

-- Delete
DELETE FROM auth.users
WHERE is_anonymous = true
  AND last_sign_in_at < now() - interval '30 days';
```

30 days lines up with the project's Supabase refresh-token TTL — anything
older than that cannot return to its session anyway.

Future work: schedule this via `pg_cron` once the VPS is live.

### Observability

Migration failures log via `console.error` to the Next.js server log:

```
[/auth/callback] migrate_anonymous_user failed: <message>
[/auth/callback] migrate_anonymous_user threw: <error>
```

In production, capture these via your log shipper / APM (Sentry, Datadog,
Logflare, etc.). A spike in either line indicates the RPC's invariants
are being violated — investigate the same day.

### Known failure modes

| Failure | User-visible impact | Resolution |
|---|---|---|
| RPC errors mid-migration | User is signed in; partial data moved | Investigate logs. Best-effort policy means we don't roll back the sign-in. |
| `sb-pending-anon-id` missing on callback | Migration skipped; anon row remains in `auth.users` | Usually benign (user wasn't anon when they clicked, or cookie expired). |
| Cookie present but anon row already deleted | RPC raises `Source user is not anonymous`; caught + logged | Possible with multi-tab races. Second tab still signs in. |
| Multiple tabs racing | First tab migrates; second tab hits the guard above | Handled — both tabs land signed in. |
| Google denies OAuth | `/auth/callback` redirects to `/auth/login?auth_error=…` | User sees the error on the login page. |

### Cookie / session edge cases

- **User opens the OAuth URL in a different browser/profile**: the
  `sb-pending-anon-id` cookie was set in the original browser. The other
  browser's callback receives no cookie → no migration. Anon row in the
  original browser is preserved. This is acceptable — it's an unusual flow.
- **User never finishes the OAuth flow**: cookie auto-expires in 10 minutes.
  No DB state mutated.
- **User signs in within the 10-minute window but in a different tab**:
  the callback in either tab will read the cookie. Whichever tab finishes
  first migrates; the other hits the "source is not anonymous" guard and
  proceeds normally.

---

## Future work / known limitations

- **Anon row GC scheduling** — the 30-day cleanup query above is not
  automated. Add a `pg_cron` job once we deploy to the VPS.
- **Other OAuth providers** — Apple / X / etc. will work through the same
  `signInWithGoogleAction` dispatch (rename or generalize the action; the
  `provider` argument is the only difference). The migration RPC is
  provider-agnostic.
- **Add-a-provider UX for real users** — a logged-in real user who wants
  to add Google as a second sign-in method needs `linkIdentity` (which
  requires `enable_manual_linking = true`). We don't expose this today.
  Separate feature.
- **Audit trail** — if "user first seen" ever matters, write the anon's
  `created_at` to `Profiles.first_seen_at` (new column) before deleting
  the anon row. Today we lose it on migration.
- **Field-level Profile merge** — current policy is "target wins." If
  anon users start meaningfully editing their profile before signing in,
  revisit this.

---

## Related code & docs

- `supabase/migrations/20260521130000_migrate_anonymous_user.sql` — the RPC
- `src/lib/profile/actions.ts` → `signInWithGoogleAction`
- `src/lib/profile/constants.ts` → `PENDING_ANON_COOKIE`
- `src/lib/auth/actions.ts` → `loginAction`, `registerAction`,
  `migrateAnonymousUserAction`
- `src/app/auth/callback/route.ts` → PKCE exchange + migration call
- `src/app/auth/login/page.tsx` → renders `?auth_error=…`
- [docs/conventions/DATA.md](../conventions/DATA.md) — Supabase patterns,
  Server Actions, RLS
- `AGENTS.md` § "Profile cabinet (`/profile`)" — the cabinet this feature plugs into
- `AGENTS.md` § "Checkout flow (`/checkout`)" — source of anon `Orders` rows we migrate
