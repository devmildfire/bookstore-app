# Anonymous-First Profile Cabinet

**Status**: Pending
**Branch**: update
**Tracker**: [anonymous-first-profile-tracker.md](./anonymous-first-profile-tracker.md)

---

## Goal

Make the user's cabinet reachable in **one click** from the header profile
icon, for anonymous *and* real users alike. No login coercion, no auth
required. Anonymous users have full access to a profile editor, order
history, and (placeholder for now) favorites. Authentication — email or
OAuth — is offered as opt-in via a "Доступ и безопасность" card and the
existing post-checkout modal.

Rename `/account` → `/profile` and reshape it as a multi-route layout with a
left nav matching the Figma.

---

## Confirmed behavior (locked via Q&A)

| Decision | Answer |
|---|---|
| Route name | `/profile` (renamed from `/account`; `/account/*` deleted outright — project is still in dev so we don't need a back-compat redirect). |
| Favorites in this PR | **No.** `/profile/favorites` renders a placeholder "Пока ничего нет". |
| Profile data storage | New `Profiles` table FK'd to `auth.users` with RLS scoped to owner. |
| Layout | Multi-route. `/profile`, `/profile/orders`, `/profile/favorites` — each is its own page sharing a `/profile/layout.tsx` with the left nav. |
| Avatar storage | New **public** `avatars` bucket, 2 MB cap, JPEG/PNG/WEBP. Path: `avatars/{user_id}.{ext}`. `Profiles.avatar_path` stores the bare object key. |
| Editable fields | nickname, avatar, ФИО, phone, birthday, "О себе" — all in v1. |
| Header icon | Both anon and real users → `/profile`. The current "real user click = logout" is removed. Logout moves into the cabinet. |
| Default nickname | Literal "Никнейм" (matches Figma placeholder). Editable any time. |
| Auth-add UI | Both: keep the post-checkout `AnonRecoveryModal` for fresh purchases AND render the same controls inline in a "Доступ и безопасность" card on `/profile`. |
| Email submission | Save to `Profiles.recovery_email` only. No verification, no Supabase `updateUser({ email })`. Future registration flow will look it up. |
| OAuth providers visible | Google, Yandex, VK, Telegram — 4 buttons in the security card and in the post-checkout modal. |
| OAuth wired in this PR | **Only Google** (real `supabase.auth.signInWithOAuth({ provider: 'google' })`). The other three show a "Скоро" toast. |
| Left nav items in v1 | Профиль / Мои книги / Избранное. "Стать автором" and "Оформить подписку" are out of scope. |
| Out of scope | Favorites; Yandex/VK/Telegram real OAuth; "Стать автором" creator dashboard; subscription management; reviews/comments. |

---

## Schema

### 1. `Profiles`

```sql
CREATE TABLE "Profiles" (
  user_id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname       TEXT NOT NULL DEFAULT 'Никнейм',
  avatar_path    TEXT NULL,        -- object key in `avatars` bucket
  full_name      TEXT NULL,
  phone          TEXT NULL,
  birthday       DATE NULL,
  about          TEXT NULL,        -- max ~1000 chars enforced client-side
  recovery_email TEXT NULL,        -- opt-in email; NOT auth.users.email
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE "Profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON "Profiles"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY profiles_insert ON "Profiles"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_update ON "Profiles"
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- No DELETE policy: profiles are deleted only via auth.users cascade.
```

### 2. `avatars` Storage bucket

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Public read; write only by the owner uploading to a path starting with their user_id.
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT TO authenticated, anon
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE TO authenticated, anon
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY avatars_delete ON storage.objects
  FOR DELETE TO authenticated, anon
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
```

Path convention: `avatars/{user_id}/{filename}.{ext}` (folder per user so RLS
can scope by the first path segment).

### 3. Lazy `Profiles` row creation

No trigger on `auth.users` insert (anon sign-ins happen on the client and the
trigger would race with cart cookie writes). Instead: a `get_or_create_profile()`
RPC that the `/profile` route hits on every load — idempotent, returns the
row or creates it with `nickname = 'Никнейм'`.

```sql
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS "Profiles"
LANGUAGE plpgsql SECURITY INVOKER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row "Profiles";
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_row FROM "Profiles" WHERE user_id = v_uid;
  IF NOT FOUND THEN
    INSERT INTO "Profiles" (user_id) VALUES (v_uid)
    RETURNING * INTO v_row;
  END IF;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION get_or_create_profile() TO anon, authenticated;
```

---

## Route + layout architecture

### Move of existing `/account`

Project is in dev, no back-compat needed: delete `src/app/account/` entirely
(no redirect, no leftover page). All callers (`/checkout` redirect URL, the
Header icon link, the post-checkout modal, OrdersList imports) are switched
to `/profile`.

### New `/profile` route tree

```
src/app/profile/
  layout.tsx                 ← server-fetches the Profile, passes to children;
                               renders the page shell + ProfileSideNav
  layout.module.scss
  page.tsx                   ← Профиль (editor + security card + post-checkout modal trigger)
  page.module.scss
  orders/
    page.tsx                 ← Мои книги (OrdersList + Order detail rendering)
    page.module.scss
  favorites/
    page.tsx                 ← Избранное placeholder
    page.module.scss
```

The layout fetches the profile server-side via `get_or_create_profile` and
provides it through React Context (`<ProfileProvider>`) so children get the
same shared instance without re-fetching.

### Header changes

`src/components/layout/Header/Header.tsx`:
- Remove the `isAnonymous ? Link href='/auth/login' : form action={logoutAction}` split.
- Always render `<Link href='/profile'>` for the profile icon.
- The icon receives the user's avatar if `Profiles.avatar_path` is set;
  otherwise the existing `<Profile />` SVG silhouette.
  - To avoid fetching Profiles in every header render: pass avatar path via
    React Context populated from the root layout (one server-side fetch).
  - **Simpler v1:** always show the silhouette icon in the header regardless
    of avatar. Avatar shows in the cabinet itself. Defer header-avatar to a
    follow-up.

### Post-checkout redirect URL

`src/app/checkout/page.tsx`:
- `router.push('/account?from=checkout&order=...')` → `router.push('/profile?from=checkout&order=...')`.

`src/app/profile/page.tsx`:
- If `searchParams.from === 'checkout'` AND `user.is_anonymous`, mount the
  existing `AnonRecoveryModal` open. Modal copy stays as-is.

---

## Components

### `<ProfileSideNav />` — left nav (`src/components/profile/ProfileSideNav/`)

Three items, current-route highlighting via `usePathname()`:

| Path | Label |
|---|---|
| `/profile` | (the current user's nickname; defaults to "Никнейм") |
| `/profile/orders` | Мои книги |
| `/profile/favorites` | Избранное |

Renders a vertical stack at tablet+ and a horizontal scroller at phone widths.

### `<ProfileEditor />` (`src/components/profile/ProfileEditor/`)

The main pane on `/profile`. Mirrors the Figma fields:

- Avatar circle with a "загрузить" button overlay
- `nickname` (text, required, default "Никнейм")
- "Гость" subtitle for anonymous users; `user.email` for real users
- "Редактировать профиль" toggles edit mode (read-only / form mode)

In edit mode, all fields become inputs:
- `full_name` (ФИО) — text
- `phone` — same regex as checkout shipping
- `birthday` — `<input type='date'>` with min/max sanity
- `about` — `<textarea>` with 1000-char hint

Save → server action that updates `Profiles` row.

### `<SecurityCard />` (`src/components/profile/SecurityCard/`)

Below the editor. Two states:

**Anonymous user (`recovery_email` is null AND no OAuth identity bound):**
- Snarky-friendly copy explaining the 30-day tether (shortened from the modal)
- Inline `<input type='email'>` + "Сохранить email" button → `setRecoveryEmailAction`
- 4 OAuth buttons in a row:
  - Google → real `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/profile' } })`
  - Yandex / VK / Telegram → toast "Скоро"

**Anonymous user who has set `recovery_email`:**
- Shows "Email сохранён: foo@bar.com" with a "Изменить" button
- Same OAuth row

**Real user:**
- Shows `user.email` and the provider they signed in with (read-only)
- "Выйти" button at the bottom of the card (calls existing `logoutAction`)
- OAuth row hidden (already authenticated)

### `<AvatarUpload />` (`src/components/profile/AvatarUpload/`)

Wraps a hidden `<input type='file' accept='image/jpeg,image/png,image/webp'>`.
On change: validates size client-side (≤ 2 MB), uploads via the browser
Supabase client `storage.from('avatars').upload('{user_id}/{filename}.{ext}', file, { upsert: true })`.
On success: calls `updateProfileAction({ avatar_path: '{user_id}/{filename}.{ext}' })`.

Render the avatar via `next/image` from the public URL constructed by
`storage.from('avatars').getPublicUrl(path)`.

### `<OrdersList />` move

`src/components/account/OrdersList/` → `src/components/profile/OrdersList/`.
No content change. The `/profile/orders/page.tsx` renders it.

### `<AnonRecoveryBanner />` removal

The banner becomes redundant once the `<SecurityCard />` is permanently
visible on `/profile`. Delete the banner component; keep only the modal +
the inline card.

### `<AnonRecoveryModal />` adjustments

- Copy stays the same.
- The "Оставить email" button still calls `setRecoveryEmailAction`.
- Add the same 4 OAuth buttons under the inline email input (for parity
  with the security card).

---

## API + Server Actions

`src/api/profile/`:
- `getProfile()` — calls `get_or_create_profile` RPC; returns `Profile`.
- `updateProfile(input)` — `UPDATE Profiles ...` for editable fields.
- `setRecoveryEmail(email)` — replaces the existing `src/api/orders/setRecoveryEmail.ts`
  (now writes to `Profiles.recovery_email` instead of `auth.users.user_metadata`).
- `index.ts` barrel — client-safe values + types.

`src/lib/profile/actions.ts`:
- `getOrCreateProfileAction()` — wraps `getProfile`.
- `updateProfileAction(input)` — wraps `updateProfile`.
- `setRecoveryEmailAction(email)` — replaces `src/lib/orders/actions.ts`'s version.
- `signInWithGoogleAction()` — Server Action that calls `signInWithOAuth({ provider: 'google' })` and returns the redirect URL.

Avatar upload happens client-side directly through `supabase.storage` —
no Server Action needed since RLS handles the user-id path check.

### Entity layer

`src/entities/profile/{server,client,normalize,validation}.ts` following the
existing pattern.

---

## Validation rules

```ts
const profileSchema = z.object({
  nickname:  z.string().trim().min(1, 'Введите никнейм').max(50),
  full_name: z.string().trim().max(150).optional().or(z.literal('')),
  phone:     z.string().trim().regex(phoneRegex, 'Введите корректный телефон').optional().or(z.literal('')),
  birthday:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  about:     z.string().trim().max(1000, 'Не более 1000 символов').optional().or(z.literal('')),
})
```

Empty strings → null on the way to the DB.

---

## Checkout shipping autofill (nice-to-have)

When the user reaches `/checkout` with the delivery form, prefill the form
from `Profiles` (`full_name → name`, `phone → phone`, `recovery_email → email`).
Won't introduce a new dependency — `useCart()` can absorb a `useProfile()`
hook fetched from the same context.

If the user changes the values in checkout, the Profiles row is NOT updated
implicitly — the user manages it explicitly from `/profile`.

---

## Migrations (one file)

`supabase/migrations/<ts>_profile_cabinet.sql`:
1. CREATE TABLE Profiles
2. RLS + policies
3. Avatars bucket + RLS
4. `get_or_create_profile()` RPC
5. `next.config.ts` redirect for `/account/*` → `/profile/*` (NOT in the
   migration — separate config change)

---

## Acceptance

- Brand-new visitor (anonymous, never visited): clicks the profile icon →
  arrives at `/profile` in one click. Sees their cabinet with nickname
  "Никнейм", Гость subtitle, default avatar silhouette.
- Edits nickname / ФИО / phone / birthday / about → saved. Reload shows the
  saved values.
- Uploads a 1 MB JPG → avatar shows. Re-upload replaces.
- Tries to upload a 5 MB file → client-side error before request.
- Tries to upload a TIFF → client-side error.
- `/profile/orders` shows the user's past orders (same as the old
  `/account` did).
- `/profile/favorites` shows the placeholder.
- Security card on `/profile`:
  - Submits email → `Profiles.recovery_email` populated. Card flips to
    "Email сохранён".
  - Clicks Google → real OAuth round-trip starts.
  - Clicks Yandex / VK / Telegram → "Скоро" toast.
- After buying as an anonymous user, the post-checkout redirect lands on
  `/profile?from=checkout&order=N` and the modal pops.
- Hitting `/account` redirects 308 to `/profile`. Same for sub-paths.
- Two browser profiles → cannot see each other's Profiles (RLS verified).
- `npm run lint` clean.

---

## Setup the user must do manually (not in code)

The Google OAuth button in `<SecurityCard />` and `<AnonRecoveryModal />`
calls `supabase.auth.signInWithOAuth({ provider: 'google', options: {
redirectTo: '<origin>/profile' } })`. For that to actually round-trip, Google
has to be enabled as a Supabase auth provider with a real OAuth client. The
code path will exist regardless — but clicking the button before this is
done will surface a Supabase error rather than a successful sign-in.

### One-time per environment (dev + prod)

1. **Google Cloud Console** — at https://console.cloud.google.com :
   - Create or select a project.
   - APIs & Services → Credentials → Create credentials → OAuth client ID.
   - Application type: **Web application**.
   - Authorized JavaScript origins: `http://localhost:3000` (dev),
     `https://chtivo.spb.ru` or whatever the prod URL is (prod).
   - Authorized redirect URIs: `<NEXT_PUBLIC_SUPABASE_URL>/auth/v1/callback`
     — for local Supabase that's `http://localhost:54321/auth/v1/callback`;
     for prod, the public Supabase URL.
   - Copy the resulting **Client ID** and **Client Secret**.

2. **Supabase dashboard / config** — for local Supabase via Docker:
   - Edit `supabase/config.toml` and set under `[auth.external.google]`:
     ```toml
     enabled = true
     client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
     secret    = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"
     redirect_uri = "http://localhost:54321/auth/v1/callback"
     ```
   - Add the two env vars to `.env` (these are read by Supabase CLI when it
     boots the local stack — they're NOT `NEXT_PUBLIC_` so they stay
     server-side):
     ```
     SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<paste>
     SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<paste>
     ```
   - Restart the local Supabase stack so it picks up the change:
     `supabase stop && supabase start`.
   - For hosted Supabase (production): the same fields live under
     Auth → Providers → Google in the dashboard. Toggle on, paste the
     credentials, save.

Once that's done, clicking the Google button on `/profile` will redirect to
Google's consent screen, then back to `/profile` with a real session.

The other three providers (Yandex, VK, Telegram) stay stubbed in this PR —
clicking them shows a "Скоро" toast and does nothing further.

---

## Out of scope

- Favorites / likes feature (placeholder only).
- Real Yandex / VK / Telegram OAuth (stubbed buttons).
- "Стать автором" / creator dashboard.
- Subscription management UI.
- Reviews / comments using nickname.
- Header avatar (silhouette only in v1).
- Real email-confirmation flow / SMTP integration.
