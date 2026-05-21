# Profile Page — Figma Redesign

**Status**: Pending
**Branch**: update
**Tracker**: [profile-redesign-tracker.md](./profile-redesign-tracker.md)
**Figma**: [overall](https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=4099-10535) · [sidebar header](https://www.figma.com/design/CZwt15WEQ3Qugfy2NM1CPy/?node-id=4099-10565)

---

## Goal

Make `/profile` visually match the Figma design. Functionally, preserve the
anon-first behavior and the anon→OAuth/email migration shipped in
[auth-flow.md](./auth-flow.md). Login and logout move into a single sidebar
CTA slot; a new login modal hosts Google OAuth (extensible to other providers
later); profile editing moves into a modal.

## Scope

In:
- Sidebar visual redesign — 450 px plain `#1A0F0F` stripe, gradient bar on the avatar/nickname header, 3 nav items (`Мои книги`, `Избранное`, `Стать автором`), red CTA at the bottom.
- Main panel redesign — large centered avatar, `Никнейм` (50 px bold), `Город` (20 px bold opacity 50 %), outlined `Редактировать профиль` button, bio rows (`ФИО`, `Номер телефона`, `Дата рождения`, `О себе`).
- New `LoginModal` (Google only) wired to the sidebar CTA for anonymous users.
- New `EditProfileModal` wired to the `Редактировать профиль` button.
- New `Profiles.city` column + entity/validation/normalize updates.
- New `$color-sidebar` SCSS token.

Out:
- Mobile/tablet breakpoints — no Figma frames provided; deferred.
- Yandex / VK / Telegram OAuth buttons — Google only for now.
- The actual `/authors` page — the sidebar "Стать автором" link points at the existing `/suggest-manuscript` stub.
- Any change to the OAuth migration logic (already shipped, untouched).
- The `Оформить подписку` red button — out of scope per request; its sidebar slot is taken by the auth CTA.

---

## Locked decisions

| Decision | Answer |
|---|---|
| `Редактировать профиль` UX | Modal with form (reuses Radix `Dialog`). |
| Sidebar auth CTA | Anonymous → red `Войти` button → opens `LoginModal` (Google for now). Real user → red `Выйти` button → calls `logoutAction` directly. |
| `Стать автором` link target | `/suggest-manuscript` (existing stub). |
| `SecurityCard` | Deleted entirely. Login + logout live in the sidebar; email/provider info aren't surfaced in the new layout. |
| Sidebar fill | New token `$color-sidebar = #1A0F0F`, plain stripe across the whole sidebar. |
| Avatar/nickname header strip | Keeps Figma gradient overlay: `linear-gradient(102.69deg, rgba(147,0,0,.2), rgba(19,19,19,.2), rgba(0,0,0,.2))` over `$color-sidebar`. |
| Active nav-item color | `$color-accent-on-dark` (#A10202) — matches Figma "Избранное" red text. |
| Email line in sidebar | Removed (current `MILDFIRE@GMAIL.COM` slot disappears — not in Figma). |
| Anonymous user view | Same sidebar shell. Default nickname `'Никнейм'` and empty avatar circle. Edit-profile button still shown (no-op modal? — see Open question). |
| Mobile/tablet | Out of scope. |

---

## Schema

New migration `supabase/migrations/<ts>_profile_city.sql`:

```sql
ALTER TABLE "Profiles" ADD COLUMN IF NOT EXISTS city TEXT NULL;
```

After applying, regenerate `src/types/supabase.ts` per `AGENTS.md`.

---

## Tokens

Add to `src/styles/params.scss`:

```scss
// Profile cabinet sidebar fill — Figma /profile design.
// Custom dark warm-black; not interchangeable with $color-bg-page.
$color-sidebar: #1A0F0F;
```

No other tokens are needed — gradient/red/text colors already exist
(`$color-accent-on-dark`, `$color-text-on-dark`, etc.).

---

## Entity layer

`src/entities/profile/`:
- `client.ts` — add `city: string | null`.
- `normalize.ts` — map `raw.city`.
- `validation.ts` — add `city: optionalTrimmed(100, 'Не более 100 символов')` to `profileSchema`.
- `server.ts` — picks up automatically from regenerated `supabase.ts`.

`src/api/profile/`:
- `updateProfile.ts` — accept `city` in the input/upsert payload.

---

## Component map (after)

```
src/components/profile/
├── ProfileSideNav/                  REWRITTEN — full sidebar shell:
│                                    • avatar+nickname header bar (gradient)
│                                    • 3 nav items (Мои книги / Избранное / Стать автором)
│                                    • bottom CTA (Войти|Выйти)
├── ProfileMainPanel/                NEW (extracted from page.tsx):
│                                    • avatar (large) + AvatarUpload overlay
│                                    • Никнейм 50px + Город 20px/50%
│                                    • outlined "Редактировать профиль" button
│                                    • bio rows (label gray, value white, dividers)
├── LoginModal/                      NEW — Radix Dialog with one button:
│                                    • "Войти через Google" → signInWithGoogleAction
│                                    • leaves vertical room for future providers
├── EditProfileModal/                NEW — Radix Dialog wrapping the existing
│                                    ProfileEditor form (extract form bits out
│                                    of ProfileEditor's read/write toggle).
├── ProfileEditor/                   RESHAPED — now an internal form-only
│                                    component used by EditProfileModal.
├── AvatarUpload/                    RESHAPED — small overlay button positioned
│                                    over the large avatar in ProfileMainPanel.
├── AnonRecoveryModal/               UNCHANGED — post-checkout modal stays.
├── AccountPostCheckoutModal.tsx     UNCHANGED — wrapper kept.
├── OrdersList/                      UNCHANGED — used by /profile/orders.
└── SecurityCard/                    DELETED (folder + index + .scss).
```

Layout (`src/app/profile/layout.tsx`) changes:
- Drop the page title "ЛИЧНЫЙ КАБИНЕТ" from the shell? — **Keep it.** Figma shows it at the top-left above the body, between header and sidebar (line 297 of the design context). Position adjusted to match Figma.
- Sidebar `<aside>` width 450 px desktop, `$color-sidebar` fill.
- `<main>` flex-grows, dark bg, vertical padding to match Figma.

Page (`src/app/profile/page.tsx`):
- Remove `SecurityCard` import + render.
- Render `<ProfileMainPanel />` instead of inline `<ProfileEditor />`.
- `AccountPostCheckoutModal` stays for anon post-checkout flow.

---

## Login flow detail (sidebar CTA → modal)

`LoginModal` props: `open`, `onOpenChange`. Inside:
- One button labeled `Войти через Google`, styled red (matches the existing OAuth button in `AnonRecoveryModal` for visual parity).
- Below it, a single muted line: `Скоро: Яндекс, VK, Telegram` — keeps a visual anchor for the future without rendering disabled buttons.
- Calls existing `signInWithGoogleAction(window.location.origin)`; on `status: 'ok'`, `window.location.href = result.url`.
- No email/password form — that lives at `/auth/login` and isn't surfaced here in this iteration. A small "Войти по email" link at the bottom of the modal could be added cheaply if desired, but is **not** in scope unless explicitly added.

For real (non-anon) users, the sidebar CTA is just a button bound to
`logoutAction` directly — no modal.

---

## Visual references / measurements

From Figma `4099:10535` (1920 px frame):

| Token / measurement | Value |
|---|---|
| Sidebar width | 450 px |
| Sidebar fill | `#1A0F0F` (per user direction) |
| Avatar header bar | 450 × 93 px, gradient over `$color-sidebar` |
| Header-bar avatar | 77 × 78 px circular, left 16 px |
| Header-bar nickname | Montserrat 24 px regular, white |
| Nav items | Montserrat 24 px regular, `$color-text-on-dark` |
| Active nav item | `$color-accent-on-dark` |
| Bottom CTA | 449 × 116 px, `main_red` (#930000), Montserrat 24 px bold white, tracking 0.72 px |
| Main: page title | Montserrat 40 px bold white, top 180 px, left of main |
| Main: avatar | 250 × 253 px circular |
| Main: nickname | Montserrat 50 px bold |
| Main: city | Montserrat 20 px bold, white at opacity 50 % |
| Edit-profile button | border `$color-text-on-dark`, padding 20 px / 80 px, height 50 px, radius 4 px |
| Bio row | label gray `#8e8e8e` 24 px, value white 24 px, with horizontal divider line |

---

## Out of scope (explicit reminders)

- **Mobile/tablet**: no breakpoints touched.
- **Other OAuth providers**: only Google wired in the modal.
- **`/authors` real page**: link target only.
- **Subscription CTA**: deferred entirely.
- **OAuth migration plumbing**: untouched (`auth-flow.md` is the source of truth there).

---

## Open question (decide during implementation, no blocker)

- For anonymous users, the `Редактировать профиль` button is still shown — should it be hidden, or should it open the edit modal that saves to the anon's `Profiles` row? **Default**: show it, let it edit the anon row; data carries forward on sign-in via `migrate_anonymous_user`. Revisit only if it feels wrong in QA.

---

## Related

- [docs/plans/auth-flow.md](./auth-flow.md) — anon→OAuth/email migration (the contract `LoginModal` relies on).
- `AGENTS.md § Profile cabinet (/profile)` — shipped invariants for the cabinet shell that this PR restyles.
