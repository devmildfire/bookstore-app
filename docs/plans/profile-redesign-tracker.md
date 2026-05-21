# Profile Page Figma Redesign — Progress Tracker

**Plan**: [profile-redesign.md](./profile-redesign.md)
**Branch**: update

Resume by reading the plan, then picking the first unchecked step.
Tick a step only after its acceptance criterion is met. Notes section at
the bottom for blockers / deviations.

---

## Steps

- [ ] **1. DB migration: `Profiles.city`**
  File: `supabase/migrations/<ts>_profile_city.sql` with
  `ALTER TABLE "Profiles" ADD COLUMN IF NOT EXISTS city TEXT NULL;`
  Apply: `supabase migration up` (or `psql -f …`).
  Accept: `\d "Profiles"` lists the `city` column.

- [ ] **2. Regenerate `src/types/supabase.ts`**
  Per `AGENTS.md § Regenerate Supabase types`.
  Accept: `Database['public']['Tables']['Profiles']['Row']` includes `city: string | null`; `npm run lint` clean.

- [ ] **3. Entity / API updates for `city`**
  - `src/entities/profile/client.ts` — `city: string | null` on `Profile`.
  - `src/entities/profile/normalize.ts` — map `raw.city`.
  - `src/entities/profile/validation.ts` — `city: optionalTrimmed(100, 'Не более 100 символов')` in `profileSchema`.
  - `src/api/profile/updateProfile.ts` — accept + persist `city` in the upsert payload.
  Accept: TypeScript compiles; saving a profile with `city` round-trips through the DB.

- [ ] **4. Add `$color-sidebar` token**
  Add `$color-sidebar: #1A0F0F;` to `src/styles/params.scss`.
  Accept: token resolves; lint clean.

- [ ] **5. Rewrite `ProfileSideNav` to the new shell**
  - Avatar/nickname header bar with the Figma gradient overlay over `$color-sidebar`.
  - 3 nav items: `Мои книги` → `/profile/orders`, `Избранное` → `/profile/favorites`, `Стать автором` → `/suggest-manuscript`.
  - Bottom CTA: anon → red `Войти` button (opens `LoginModal`); real user → red `Выйти` button (calls `logoutAction`).
  - Width 450 px, full-height stripe.
  - Active nav-item color = `$color-accent-on-dark`.
  - Drop the email line entirely.
  Accept: side-by-side with Figma at 1920 px width, the sidebar matches within ~4 px on every measured dimension; logout works; login opens the modal stub.

- [ ] **6. Build `LoginModal`**
  Folder: `src/components/profile/LoginModal/` (`LoginModal.tsx`, `LoginModal.module.scss`, `index.ts`).
  - Radix `Dialog.Root` controlled via props.
  - One button "Войти через Google" → `signInWithGoogleAction(window.location.origin)` → `window.location.href = result.url`.
  - Muted footnote "Скоро: Яндекс, VK, Telegram".
  - Error path: `result.status === 'error'` → toast via existing toast util.
  Accept: clicking the sidebar `Войти` opens the modal; Google sign-in still goes through `migrate_anonymous_user` correctly (re-runs the smoke test from `auth-flow.md § Local dev smoke test`).

- [ ] **7. Build `EditProfileModal`**
  Folder: `src/components/profile/EditProfileModal/`.
  - Radix `Dialog.Root` controlled via props.
  - Body: extract the form portion of the current `ProfileEditor` into the modal. Fields: `nickname`, `city`, `fullName`, `phone`, `birthday`, `about`.
  - Save → existing `updateProfileAction`; on success close modal + refresh.
  Accept: clicking `Редактировать профиль` opens the modal, fields prefill from current profile, save persists across reload.

- [ ] **8. Reshape `ProfileEditor` into a form-only component**
  Drop the read/write toggle and the display rows. ProfileEditor now exports just the form (used inside `EditProfileModal`). Keep validation + submit logic.
  Accept: no more usages of `ProfileEditor` from outside the modal.

- [ ] **9. Build `ProfileMainPanel`**
  Folder: `src/components/profile/ProfileMainPanel/`.
  - Centered large avatar (250 × 253 px) with `AvatarUpload` overlay.
  - `Никнейм` 50 px bold, `Город` 20 px bold opacity 50 % (skipped if `profile.city` is null).
  - Outlined `Редактировать профиль` button → opens `EditProfileModal`.
  - Bio rows: ФИО / Номер телефона / Дата рождения / О себе. Label gray `#8e8e8e` 24 px, value white 24 px, horizontal divider between rows.
  - Empty values render as `—`.
  Accept: matches Figma at 1920 px within ~4 px on measured dimensions; rendered data is the current profile's.

- [ ] **10. Reshape `AvatarUpload` to be the large-avatar overlay**
  Small camera/edit icon button anchored bottom-right of the avatar circle in `ProfileMainPanel`. Existing upload logic preserved.
  Accept: hover state visible; upload still hits the `avatars` bucket and updates `Profiles.avatar_path`.

- [ ] **11. Delete `SecurityCard`**
  Remove `src/components/profile/SecurityCard/` (folder, index, .scss) and its import from `src/app/profile/page.tsx`. Grep confirms zero remaining references.
  Accept: `grep -rn SecurityCard src/` returns no hits; the page still builds.

- [ ] **12. Update `src/app/profile/layout.tsx` and `page.tsx`**
  - Layout: title `ЛИЧНЫЙ КАБИНЕТ` positioned per Figma; sidebar width 450 px; main area dark bg; correct paddings.
  - Page: renders `<ProfileMainPanel />` instead of inline `<ProfileEditor />` + `<SecurityCard />`. `AccountPostCheckoutModal` stays.
  Accept: navigation in/out works; `/profile/orders` and `/profile/favorites` still mount inside the same shell.

- [ ] **13. Visual QA pass against Figma**
  Browser at 1920 × 1080 (or scale to match), compare side-by-side with the Figma frame:
  - Sidebar dimensions, fill, gradient bar, nav item positions, CTA position.
  - Main panel avatar size + position, typography weights/sizes, divider lines, button border.
  - Anon view: same shell, default placeholders, login modal opens.
  - Real user view: nickname + email-derived fallback if nickname unset, logout works.
  Accept: a screenshot diff against the Figma export shows no major (>8 px) misalignments.

- [ ] **14. Update `AGENTS.md § Profile cabinet (/profile)`**
  Replace the existing section's invariants with the post-redesign ones:
  - Note new `Profiles.city` column and what it's for.
  - Note that login + logout both live in the sidebar CTA, fronted by `LoginModal` (anon) or direct `logoutAction` (real).
  - Note `Стать автором` link target.
  - Note `SecurityCard` is removed.
  Accept: section in `AGENTS.md` reads accurately for an agent landing in the repo cold.

- [ ] **15. Delete this plan + tracker**
  Once steps 1–14 are merged, delete `docs/plans/profile-redesign.md` and `docs/plans/profile-redesign-tracker.md`. The post-redesign state lives in `AGENTS.md`.
  Accept: the two files are gone; `grep -r 'profile-redesign' docs/` finds no references.

---

## Notes / blockers

(none yet)
