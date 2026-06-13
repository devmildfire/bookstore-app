# UI component unification — one set for storefront + admin

Status: **in progress** (started 2026-06-13).

The app must have **one** implementation of each UI primitive, in
`src/components/common/`, used by both the storefront and `/admin`. Differences
in look or behaviour are expressed with **props** (`variant`/`size`/`tone`/flags),
never by forking a second component or writing a one-off. See the principle at
the top of [docs/conventions/COMPONENTS.md](../conventions/COMPONENTS.md).

This doc tracks collapsing the historical `admin/Admin*` duplicates (and a few
storefront duplicates) into single shared `common/` components.

## Approach

For each pair: pick the canonical implementation (usually the dark
design-system one), move it to `common/<Name>`, fold any needed variation into
props, migrate **all** consumers (`sed` the import + tag), delete the duplicate,
then `npx tsc --noEmit` + `npx eslint`. Bare/wrapped ergonomics (render just the
control vs a labelled block) are handled inside the one component (see `Input`).

## Tracker

Legend: ✅ done · 🟡 in progress · ⬜ not started

| Pair | Canonical target | Consumers | Status | Notes |
|------|------------------|-----------|--------|-------|
| `AdminInput` + `common/Input` | `common/Input` | 33 + 2 | ✅ | Done 2026-06-13. Dark design-system field, number-safe, bare/wrapped modes. `Admin*` deleted. The old light `common/Input` had no live consumers (orphaned FiltersPanel/SearchBar). |
| `AdminTextarea` + `common/Textarea` | `common/Textarea` | 8 + 0 | ✅ | Done 2026-06-13 alongside Input. |
| `AdminSelect` + `common/Select` | `common/Select` | 11 + 2 | ⬜ | Two different dropdowns (admin custom dropdown w/ Scroller vs storefront select). Reconcile API; likely keep the admin custom dropdown as the base, add a storefront-friendly variant/props. Header storefront select is the one documented exception today — re-check. |
| `AdminPager` + `common/Pagination` | `common/Pagination` | 3 + 0 | ⬜ | `common/Pagination` is orphaned; fold its needs (if any) into the admin pager and move to common. |
| `StatusBadge` + `common/Badge` | `common/Badge` | 13 + 0 | ⬜ | `common/Badge` orphaned. Move StatusBadge → `common/Badge` with a `tone` prop (positive/warning/neutral/accent). |
| `admin/ComingSoon` + `common/ComingSoon` | `common/ComingSoon` | 0 + 0 | ⬜ | Both orphaned — delete the admin copy, keep one in common (or remove both if truly unused). |
| `AdminDatePicker` | `common/DatePicker` | 5 | ⬜ | No storefront equivalent; just relocate `admin/AdminDatePicker` → `common/DatePicker` (already used by the storefront ProfileEditor). |
| `Button` / `PrimaryButton` / `OutlinedButton` | `common/Button` | 34 / 3 / 6 | ⬜ | All in `common/` already but three components for one concept. Collapse `PrimaryButton`/`OutlinedButton` into `Button` variants (`primary`/`outlined`), migrate, delete the extras. |
| `AdminList` / `AdminFilterBar` / `AdminPageHeader` / `ImageUploader` | (review) | — | ⬜ | Evaluate whether these are generic enough to move to `common/`; some may be legitimately admin-only compositions. |

Genuinely admin-only chrome that stays under `admin/`: `AdminShell`,
`AdminSideNav` (the panel's layout shell, not reused on the storefront).

## Notes / gotchas

- The shared field styling lives in the `admin-field` mixin
  (`src/styles/mixins.scss`) — despite the name it's now the **app-wide** field
  base (Input/Textarea/Select/DatePicker). Consider renaming it `field-base` when
  the select/date-picker moves land.
- When a target `common/` component already exists but is orphaned (Pagination,
  Badge, ComingSoon), replace its implementation with the canonical one rather
  than adding a third.
