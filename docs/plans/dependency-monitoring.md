# Dependency & Vulnerability Monitoring — Operating Guide

**Status:** live · **Reworked:** 2026-10-18 (after a 12-week silent stall — see §6) · **First shipped:** 2026-06-27
**Single source of truth** for dependency upkeep. `AGENTS.md`, `docs/deployment/README.md` and
`docs/deployment/github-actions-ci-cd.md` only link here — change behaviour here, not there.
**Related:** [infra-image-automation.md](infra-image-automation.md) (candidate image tests, prod apply),
[org-merge-queue.md](org-merge-queue.md) (future: native merge queue replaces the push-rebase cascade).

---

## 1. The loop at a glance

```
 Renovate (weekly + on every merge to main + on new Trivy critical)
   └─ PR ─▶ ci.yml (audit diff-gate → lint → unit → integration → build → e2e)
           + candidate-image-test.yml (Tier-1/2/3 for infra images)
             ├─ green ─▶ GitHub native auto-merge ─▶ main      (prod: manual promote, §4)
             └─ red ───▶ renovate-alert.yml ─▶ Telegram ONCE per PR (label `alerted`)
 Dependabot alerts (continuous) ─────────────▶ Security tab
 Trivy (nightly) ─ SARIF ─▶ Code scanning ─▶ NEW critical ─▶ Telegram + dispatch Renovate
 renovate.yml digest (weekly) ─▶ Telegram: loop health (stall / red PRs / prod lag / criticals / PAT)
```

Every Telegram message is one of four kinds, and each means something different:

| Message | Source | Meaning / what to do |
|---|---|---|
| ✅/⚠️ **Dependency loop health** | weekly digest | ⚠️ lines are stall signals — see runbook §5. ✅ = nothing to do (also proves alerting works). |
| ⚠️/🛑/🚨 **update failed checks** | `renovate-alert.yml` | THIS update broke something (audit is a diff gate, so not a pre-existing advisory). Fix, or close the PR / reject on the dashboard. Sent once per PR. |
| 🛑 **Trivy: NEW CRITICAL** | `trivy.yml` | A newly detected fixable critical (CVE, package, fix version listed). Renovate is auto-dispatched; make sure the fix merges **and is promoted to prod**. |
| 🔴 **Renovate / Trivy FAILED** | either workflow | The machinery is broken (expired `RENOVATE_TOKEN`, config error, scan error). Nothing is being updated/detected until fixed. |

Runtime/SLO alerts (Prometheus → Alertmanager → same bot) are separate: [docs/monitoring/README.md](../monitoring/README.md).

---

## 2. Update policy (`renovate.json`)

| Update class | Behaviour |
|---|---|
| **npm** patch/minor/pin/digest | ONE grouped PR `npm (non-major)`, auto-merge on green. `prPriority` 5. |
| **Lock file maintenance** | Auto-merge on green, `prPriority` 10 (carries most transitive security fixes). |
| **Security fixes** (`vulnerabilityAlerts`) | Separate PR per package, label `security`, auto-merge on green. Known gap: a package that must move with its monorepo sibling (vitest ↔ @vitest/coverage-v8) breaks `npm ci` on its own — the grouped PR / lockfile maintenance then carries it. |
| **Majors** (all managers except Actions) | **Dependency Dashboard approval** first; once approved, auto-merge on green like the rest (labelled `major`). |
| **GitHub Actions** (incl. majors) | Auto-merge on green. |
| **Candidate-tested images** (nginx, kong, grafana, prometheus, node-exporter, pushgateway, alertmanager, postgrest, postgres-meta, postgres-exporter) | patch/minor/digest auto-merge, gated by the required `Tier-1 candidate boot` check. |
| **Stateful trio** (postgres/gotrue/storage-api) | patch/minor/digest auto-merge, gated by the **Tier-3 migration-compat** test (same required check). Lands in the repo only — prod apply is the rehearsed runbook. |
| **Untested images** (cloudflared, studio, cadvisor, nginxlog-exporter, node in monitoring) | **Dashboard approval** → PR → manual merge. |
| **Renovate itself** (`RENOVATE_VERSION` in `renovate.yml`) | patch/minor auto-merge. |

Why approval instead of open PRs for majors/untested images: an open PR nobody merges holds a
`prConcurrentLimit` slot forever. That is exactly how the high-value grouped/lockfile PRs got starved.

Exact pins: every npm dep is exact (`.npmrc save-exact=true`, `rangeStrategy: pin`) — project HARD RULE.
`engines` is left alone (deliberate floor). `package.json` `overrides.postcss` is a security pin over
next's nested postcss — keep it ≥ next's own pin; Renovate bumps it.

---

## 3. Gates and detectors

- **`audit-reusable.yml`** (required check `audit / npm audit (fail on high/critical)`) — **diff gate**:
  fails only if the change *adds* a runtime (`--omit=dev`) high/critical advisory vs its base commit
  (PR base / merge-group base / previous main commit). Fails loudly if `npm audit` itself errors.
  Pre-existing advisories are printed as a warning, never block. Dev-only advisories: Dependabot.
- **Dependabot** — alerts ON, security *updates* OFF (Renovate is the single PR source). No `dependabot.yml`.
- **`trivy.yml`** nightly — `:production` image (what's running) → `trivy-prod-image`; repo fs
  misconfig + secrets → `trivy-fs`; both SARIF → Code scanning. Informational (job summary only):
  `:latest` + every third-party image in both compose files, **derived from the compose files**.
  `ignore-unfixed` everywhere. Accepted risks → `.trivyignore` (or `.trivyignore.yaml` with `expired_at`).
- **Candidate image tests** — [infra-image-automation.md](infra-image-automation.md) §0.3.

Branch protection on `main`: 7 required checks (`audit / npm audit (fail on high/critical)`,
`Lint & build check`, `unit / Unit tests`, `integration / Integration tests`, `build / Build & push`,
`e2e / Playwright E2E`, `Tier-1 candidate boot`); **not** strict (branches needn't be up to date);
enforced for admins; no required reviews. Renaming any of these jobs breaks protection — keep names.

---

## 4. From merged to deployed

Merging changes **git, not the VPS**.

| Update kind | Path to prod |
|---|---|
| App deps / app image | `git push origin main:production` → `deploy-production.yml` (requires green `ci.yml` for the SHA). **Manual** — the digest warns when prod lags >30 days. |
| Infra images / compose / nginx | Manual [infra-sync.md](../deployment/infra-sync.md): drift-audit → backup → sync → validate → recreate by name → verify. |
| Stateful trio | Rehearsed restore / runbook ([supabase-production-bootstrap.md](../deployment/supabase-production-bootstrap.md)). |

A security fix is not done until it is **promoted**: Trivy keeps scanning `:production`, not `main`.

---

## 5. Runbook

**Loop stalled** (digest: "last Renovate merge Nd ago", old open PRs, "Red: #…"):
1. Open a red PR → which check fails? If many PRs fail the *same* check, the cause is on `main`, not in
   the PRs — fix `main` first (one manual PR), then tick "rebase all open PRs" on the Dependency Dashboard.
2. Check the dashboard's **Rate-Limited** section: if lockfile maintenance / `npm (non-major)` sit there,
   stuck PRs are hogging slots — close the stale ones (Renovate recreates them when relevant).
3. Stale security PRs targeting an outdated fix version: close them; Renovate reopens with the current target.

**Security PR red** — usually a monorepo split (see §2) or a breaking change in the fixed version.
Do it by hand: bump the package + its siblings, `npm audit --omit=dev`, lint/unit/build, PR, then
**promote to prod**. Regenerate the lockfile with CI's npm (`npx npm@<node's bundled npm> install`);
a different npm version can drop optional `@emnapi/*` entries and break `npm ci`.

**New CRITICAL page** — check the listed fix version vs `main` (`npm ls <pkg>`). If `main` already has it,
just promote. If not, merge the Renovate PR it dispatched (or do it by hand), then promote.

**`RENOVATE_TOKEN` expiring / Renovate failed** — create a new fine-grained PAT, this repo only:
`Contents`, `Pull requests`, `Issues`, `Workflows`: write; `Dependabot alerts`, `Metadata`: read.
Update the secret, dispatch `renovate.yml`. (The digest reads the expiry from the
`github-authentication-token-expiration` header and warns <30 days before.)

**Accepting a finding** — `.trivyignore` line `ID # reason, owner, date`, or `.trivyignore.yaml` with
`expired_at` so it resurfaces. Never dismiss silently.

---

## 6. History & decisions

- **2026-06-27** — shipped: self-hosted Renovate (PAT so its PRs trigger CI; no Mend app), Dependabot
  alerts only, Trivy nightly → SARIF, `npm audit --audit-level=high` gate, protected `main`.
- **2026-07** — "autonomous loop": npm (incl. majors) + Actions auto-merge; candidate-tested infra
  images (Tier-1/2) auto-merge; stateful trio un-frozen behind the Tier-3 migration-compat test.
- **2026-07-22 → 10-18 — silent stall.** A Next.js advisory (later CVE-2026-75604, unauthenticated RCE)
  hit `main`. The whole-tree audit gate then failed **every** PR, including the fixes; 11 stuck PRs
  filled `prConcurrentLimit`, so the grouped/lockfile PRs that would have fixed it were never created;
  per-package security PRs each failed on the others. Alerts fired correctly but were repetitive
  (~5 identical per week + 89 identical nightly pages) and said nothing actionable, so the RCE ran in
  prod for ~3 months. Nothing watched the loop itself.
- **2026-10-18 — rework** (this doc): audit → diff gate; majors + untested images → dashboard approval;
  `prPriority` for grouped/lockfile; `needs-review` label dropped (it was mis-applied via stacked
  `addLabels`); Renovate version pinned + self-updating; failure alert once per PR with failed jobs;
  Trivy pages only NEW criticals with details + dispatches Renovate; informational image list derived
  from compose; weekly loop-health digest (stall, red PRs, prod lag, criticals, PAT expiry);
  Renovate/Trivy self-failure alerts; one shared sender `scripts/notify-telegram.sh`.

Rejected: Mend hosted app (third-party write access); Dependabot version updates (duplicate PRs);
auto-deploying anything to prod from Renovate (prod promote stays human); external platforms (Snyk etc.).
