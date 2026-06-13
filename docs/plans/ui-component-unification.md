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
| `StatusBadge` + `common/Badge` | `common/Badge` | 13 + 0 | ✅ | Done 2026-06-13 (commit d8dac5ed). `common/Badge` now = the StatusBadge impl, `tone` prop (neutral/positive/warning/danger/accent). |
| `AdminPager` + `common/Pagination` | `common/Pagination` | 3 + 0 | ✅ | Done 2026-06-13 (commit c265f6fb). Link-based (SSR-safe), `variant='simple'` (admin) / `'numbered'` (storefront). |
| `admin/ComingSoon` + `common/ComingSoon` | `common/ComingSoon` | 0 + 0 | ✅ | Done 2026-06-13. Both were dead code; deleted the admin copy, kept `common/ComingSoon`. |
| **icon barrel** `admin/icons` → `common/icons` | `common/icons` | 12 | ✅ | Done 2026-06-13 (commit e635c881). Moved the barrel `index.tsx` to `common/icons` (the standalone `CartPlusIcon`/`ProductTypeIcon` stay as separate files — no collision), repointed 12 importers, removed a backwards dep from `common/NumberStepper`. |
| `AdminDatePicker` → `common/DatePicker` | `common/DatePicker` | 5 | ✅ | Done 2026-06-13 (commit e635c881). Relocated + renamed; now imports icons from `common/icons`. |
| `AdminSelect` + `common/Select` | `common/Select` | 11 + 2 | ✅ | Done 2026-06-13 (commit 9091c27f). Custom-dropdown base (Radix can't do empty values / hidden-input form submit); supports controlled (`value`/`onValueChange`) + uncontrolled (`name`/`defaultValue` + hidden input) + optional `label`/`error`. `onChange` kept as an alias. |
| `Button` / `PrimaryButton` / `OutlinedButton` | `common/Button` | 34 / 3 / 6 | ✅ | Done 2026-06-13 (commit f83ba0ca). Added `cta`/`ctaOutline` variants (verbatim Figma styles) + `href` link mode + `fitContainer`; existing 34 untouched, 9 CTA consumers migrated, extras deleted. |
| `AdminList` / `AdminFilterBar` / `AdminPageHeader` / `ImageUploader` | (review) | — | ⬜ | Evaluate whether these are generic enough to move to `common/`; some may be legitimately admin-only compositions. Lower priority — these are single components (not duplicates), just located under `admin/`. |

Genuinely admin-only chrome that stays under `admin/`: `AdminShell`,
`AdminSideNav` (the panel's layout shell, not reused on the storefront).

## Status

All true duplicates are collapsed: **Input, Textarea, Select, Pagination, Badge,
DatePicker, the icon barrel, and the button trio** now have one implementation in
`common/`. Remaining work is only the optional review of the admin-only
compositions above (`AdminList`/`AdminFilterBar`/`AdminPageHeader`/`ImageUploader`),
which are not duplicates. The shared field styling lives in the `field-base` mixin
(`src/styles/mixins.scss`) — the app-wide base for Input/Textarea, and the source
of the same look in Select/DatePicker.

## Notes / gotchas

- When a target `common/` component already exists but is orphaned (Pagination,
  Badge, ComingSoon), replace its implementation with the canonical one rather
  than adding a third.
