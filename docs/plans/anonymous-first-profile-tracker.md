# Anonymous-First Profile Cabinet — Progress Tracker

**Plan**: [anonymous-first-profile.md](./anonymous-first-profile.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Notes section
at the bottom for blockers.

---

## Steps

- [ ] **1. DB migration: Profiles + avatars bucket + RPC**
  File: `supabase/migrations/<ts>_profile_cabinet.sql`
  - `Profiles` table with default `nickname = 'Никнейм'`
  - RLS policies (select/insert/update; no delete)
  - `avatars` bucket (public, 2 MB cap, JPEG/PNG/WEBP)
  - storage.objects RLS scoped by `(storage.foldername(name))[1] = auth.uid()`
  - `get_or_create_profile()` RPC
  Apply via psql. Accept: `\d "Profiles"` shows columns; bucket select returns
  one row; the RPC creates a row for a fresh user_id and returns the existing
  row on second call.

- [ ] **2. Regenerate `src/types/supabase.ts`**
  Per AGENTS.md. Accept: `Profiles` and RPC visible; `npm run lint` clean.

- [ ] **3. Entity layer: `src/entities/profile/`**
  - `server.ts`, `client.ts` (Profile type), `normalize.ts`, `validation.ts`
  - Zod schema for the editor inputs.
  Accept: types compile, schemas parse a known-good payload.

- [ ] **4. API layer: `src/api/profile/`**
  - `getProfile.ts` (browser, calls RPC)
  - `updateProfile.ts` (browser, RLS-scoped UPDATE)
  - `setRecoveryEmail.ts` (browser, UPDATE single column on Profiles)
  - `index.ts` (client-safe exports)
  Accept: each function has explicit types; smoke via dev console works.

- [ ] **5. Server Actions: `src/lib/profile/actions.ts`**
  - `getOrCreateProfileAction()`
  - `updateProfileAction(input)`
  - `setRecoveryEmailAction(email)` — replaces the one in `src/lib/orders/actions.ts`
  - `signInWithGoogleAction()` — wraps `signInWithOAuth({ provider: 'google' })`
  Accept: actions are `'use server'`, return typed shapes, no throw to client.

- [ ] **6. Delete `src/lib/orders/actions.ts`'s setRecoveryEmail + cleanup**
  - Remove `setRecoveryEmailAction` and `setRecoveryEmail` API/Action from
    `src/api/orders/` + `src/lib/orders/actions.ts`.
  - Update `<AnonRecoveryModal />` to import the new profile-namespaced action.
  Accept: nothing imports the old `setRecoveryEmail`; lint + tsc clean.

- [ ] **7. Move `/account` → `/profile` (rename + layout)**
  - Create `src/app/profile/{layout,page}.tsx` + sub-routes
    `src/app/profile/orders/page.tsx` + `src/app/profile/favorites/page.tsx`.
  - Layout fetches Profile server-side via `get_or_create_profile`, passes
    to children via React Context (`<ProfileProvider>`).
  - Delete `src/app/account/` entirely (no redirect — project still in dev).
  Accept: `/profile`, `/profile/orders`, `/profile/favorites` all render;
  `/account` returns 404 (acceptable for now).

- [ ] **8. `<ProfileSideNav />`**
  `src/components/profile/ProfileSideNav/`
  - Three items: current nickname (links `/profile`), `Мои книги`
    (`/profile/orders`), `Избранное` (`/profile/favorites`).
  - Active route highlight via `usePathname()`.
  - Vertical at tablet+, horizontal scroller at phone.
  Accept: nav renders, active item is visually distinct, switching items
  routes correctly.

- [ ] **9. `<AvatarUpload />`**
  `src/components/profile/AvatarUpload/`
  - File input, client-side size + MIME validation (≤ 2 MB; JPEG/PNG/WEBP).
  - Upload via browser Supabase client to `avatars/{user_id}/{filename}.{ext}`
    with `upsert: true`.
  - Calls `updateProfileAction({ avatar_path })` on success.
  - Renders the current avatar via `next/image` from
    `supabase.storage.from('avatars').getPublicUrl(avatar_path).publicUrl`.
  - Fallback: existing `<Profile />` silhouette SVG when no avatar.
  Accept: 1 MB JPEG upload succeeds; 5 MB file rejected client-side; TIFF
  rejected; avatar persists across reload.

- [ ] **10. `<ProfileEditor />`**
  `src/components/profile/ProfileEditor/`
  - Read-only view + edit-mode toggle.
  - Fields: nickname (required), ФИО, phone, birthday, "О себе".
  - React Hook Form + Zod.
  - Save → `updateProfileAction`.
  Accept: edits persist, validation catches bad values, nickname required.

- [ ] **11. `<SecurityCard />`**
  `src/components/profile/SecurityCard/`
  - Three states: anon-no-email, anon-with-email, real-user.
  - Anonymous: snarky short copy, inline email input, 4 OAuth buttons.
    Google → real OAuth (`signInWithGoogleAction`), others → "Скоро" toast.
  - With email: shows saved email + Изменить.
  - Real user: shows email + provider + Выйти button (calls `logoutAction`).
  Accept: state transitions correctly; saving an email flips the card;
  Google OAuth round-trip starts when clicked.

- [ ] **12. `/profile/page.tsx` wiring**
  - Renders `<ProfileEditor />` + `<SecurityCard />`.
  - Reads `searchParams.from` and `searchParams.order`; if `from=checkout`
    AND `user.is_anonymous`, mounts `<AnonRecoveryModal />` open.
  - Updates the modal: snarky copy unchanged; "Оставить email" calls new
    profile-namespaced `setRecoveryEmailAction`; adds OAuth buttons row.
  Accept: editor + card render; post-checkout flow still triggers modal.

- [ ] **13. `/profile/orders/page.tsx`**
  - Renders `<OrdersList />` (moved from `src/components/account/` to
    `src/components/profile/`).
  - Highlights `searchParams.order` when present.
  Accept: orders show; download buttons work as before.

- [ ] **14. `/profile/favorites/page.tsx`**
  - Static placeholder: "Избранное" heading + "Пока ничего нет" message.
  Accept: page renders at the route.

- [ ] **15. Header: anon AND real → `/profile`**
  `src/components/layout/Header/Header.tsx`
  - Remove the anonymous/real fork.
  - Single `<Link href='/profile'>` for the profile icon.
  - Delete the inline logout form (logout now lives in `<SecurityCard />`).
  - Update `aria-label` to "Личный кабинет".
  Accept: header icon goes to `/profile` regardless of auth state; no
  accidental logouts.

- [ ] **16. Update post-checkout redirect URL**
  `src/app/checkout/page.tsx`
  - `router.push('/account?from=checkout&order=...')` → `/profile?from=checkout&order=...`
  Accept: placing an order lands on `/profile`, modal appears for anon.

- [ ] **17. Delete the `<AnonRecoveryBanner />`**
  - Remove `src/components/account/AnonRecoveryBanner/`.
  - Remove references in old `/account/page.tsx` (already removed in step 7).
  The persistent banner is replaced by the always-visible `<SecurityCard />`.
  Accept: nothing imports the deleted component.

- [ ] **18. Move `<OrdersList />` → `src/components/profile/OrdersList/`**
  Pure rename + import path updates. Content unchanged.
  Accept: imports resolve; orders render.

- [ ] **19. Checkout shipping autofill from Profile (nice-to-have)**
  `src/components/checkout/DeliveryForm/DeliveryForm.tsx`
  - Read Profile (via `useProfile()` context) and use `full_name`, `phone`,
    `recovery_email` as `defaultValues` for the form.
  - Edits in checkout do NOT mutate Profile.
  Accept: filled-out profile pre-populates the delivery form; cleared
  profile still works.

- [ ] **20. Visual verification**
  - One-click from header icon to `/profile` for anon AND real users.
  - All editable fields save and persist across reload.
  - Avatar upload flows (success, size error, MIME error).
  - Post-checkout redirect lands on `/profile`; modal pops for anon.
  - `/account/*` redirects work.
  - `/profile/orders` matches previous `/account` orders view.
  - Security card renders correctly for each user state.
  - Google OAuth click initiates the round-trip (or fails gracefully if
    Supabase Google provider isn't configured yet).
  - Verify at 1920 / 1024 / 360 widths.

- [ ] **21. Lint, commit, push**
  `npm run lint`. Check diff for secrets / >1 MB (avatar bucket has no
  uploaded files; PR diff is code only). Commit with short imperative slug.
  Push immediately.

- [ ] **22. PING the user about Google OAuth provider setup**
  Final step before declaring done: tell the user (in the chat reply that
  reports the commit) that they need to configure Google as a Supabase auth
  provider per the "Setup the user must do manually" section of the plan
  for the Google button to actually work. List the two env vars they need
  to set and the dashboard / config.toml change required. Without this
  step the button shows a Supabase error on click.

---

## Notes / blockers

_(append entries as you work — date, what happened, what's needed to unblock)_
