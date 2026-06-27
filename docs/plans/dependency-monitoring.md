# Dependency & Vulnerability Monitoring — Implementation Plan

**Status:** planning (no code yet) · **Created:** 2026-06-27
**Source brief:** `~/Downloads/dependency-monitoring-plan.md` (high-level goals; this plan is the
precise, repo-specific execution).
**Related:** [.github/workflows/ci.yml](../../.github/workflows/ci.yml),
[deploy/production/docker-compose.yml](../../deploy/production/docker-compose.yml),
[docs/deployment/github-actions-ci-cd.md](../deployment/github-actions-ci-cd.md),
[docs/monitoring/README.md](../monitoring/README.md) (Telegram/Alertmanager path).

---

## 1. Goal

Keep dependencies current and catch newly-disclosed vulnerabilities — across npm packages,
the Docker base image, the prod compose images, and GitHub Actions — with **minimal
maintenance** and **no new always-on platform**. Everything is GitHub-native plus one
self-hosted scanner job; the only standing cost is reviewing PRs and the occasional security
finding.

This plan adapts the generic brief to four hard realities of *this* repo:

1. **Exact-pin discipline.** Every npm dep is an exact version — zero `^`/`~` ranges (project
   HARD RULE). The updater must *replace* an exact pin with a new exact pin, never widen to a
   range.
2. **Migration-coupled images.** `postgres` / `gotrue` / `storage-api` in the prod compose are
   pinned to match the restored DB dump + migration state; bumping them needs a rehearsed
   restore, not an automated PR.
3. **Manual infra deploys.** Compose / `.env` / nginx changes are hand-synced to the VPS; image
   rolls are the only automated deploy. A compose-image PR updates the *repo*, not the running
   stack.
4. **Existing controls.** `npm audit --audit-level=high` already gates CI + deploy
   (`audit-reusable.yml`), and a Telegram alert path already exists (Alertmanager on the VPS).
   We extend these, not duplicate them.

---

## 2. Locked decisions (decision log)

These were decided up-front; the rationale is the point of the document.

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Self-hosted Renovate** (GitHub Action on cron), not the Mend hosted App | Consistent with the project's self-hosted-everything thesis (Supabase, Prometheus/Grafana). No third-party GitHub App gets read/write to the repo. We own the schedule + execution. |
| D2 | **Fine-grained PAT** (`RENOVATE_TOKEN`), repo-scoped (contents + PRs: write) | Simpler than a dedicated GitHub App; sufficient for self-hosted Renovate. Critically: a non-`GITHUB_TOKEN` identity is **required** so Renovate's PRs trigger `ci.yml` (GitHub suppresses workflow triggers from `GITHUB_TOKEN`), which the automerge-on-green tier depends on. Cost: account-bound, manual expiry — tracked in the maintenance policy. |
| D3 | **Renovate is the single PR source**; Dependabot **Alerts ON, Security Updates OFF** | Both bots can raise CVE-fix PRs; running both = duplicate PRs. Renovate raises everything (incl. `vulnerabilityAlerts`); Dependabot's alert graph stays for the native Security dashboard + email. No `dependabot.yml` (that file is for *version* updates, which Renovate owns). |
| D4 | Renovate manages **stateless** compose images; **ignores** `postgres`/`gotrue`/`storage-api` | Those three are coupled to the restored dump + migration state — see [deploy/production/README.md](../../deploy/production/README.md) "Version pinning rationale". A bump requires a rehearsed restore, so it must never arrive as an auto-PR. |
| D5 | **Limited automerge**, gated on green `ci.yml` | Risk-tiered: automerge only GitHub Actions updates, devDependency patch/minor, and lockfile maintenance — *because* the unit+integration+e2e suite gates them. App deps (any), majors, and all Docker/base/compose bumps stay manual PRs. Ties the real test suite into the update flow. |
| D6 | **Trivy** scans app image (gates HIGH/CRIT) + filesystem (misconfig + secrets) + Supabase images (**informational**, no gate) | The app image + repo are what we can fix → they gate. The Supabase images are third-party + deliberately pinned → report-only visibility of the full deployed CVE surface, without a gate we can't act on. |
| D7 | Trivy findings → **SARIF to GitHub Security** (Code scanning) | Repo is public, so Code scanning is free. Browsable/dismissable/historical, dedups with Dependabot — the idiomatic GitHub-native integration. |
| D8 | **Mirror CRITICAL Trivy failures to Telegram** | Reuses the existing alert bot (Bot API call from the workflow). Supply-chain PRs/alerts stay GitHub-native; only the high-severity *runtime-relevant* scanner failures also page Telegram, alongside the existing SLO alerts. |
| D9 | **Keep the `npm audit` deploy gate** | Synchronous + blocking: a known high/critical npm CVE stops the build from shipping. Renovate/Dependabot are async (PRs/alerts) and cannot stop a deploy. Complementary defense-in-depth. |
| D10 | **Protect `main`** with required CI checks | Trunk hygiene + enables Renovate's native auto-merge. **Consequence: ends direct push-to-main** — all changes (yours included) go through PRs. `ci.yml` already runs on `pull_request → main`, so the flow is fully supported. |

### Rejected / out of scope
- **Mend hosted Renovate App** — rejected per D1 (third-party repo access).
- **Auto-bumping the stateful Supabase trio** — rejected per D4 (migration risk).
- **Dependabot version updates** (`dependabot.yml` with `package-ecosystem` entries) — rejected
  per D3 (Renovate owns versions; would duplicate PRs).
- **External platforms (Snyk, Grafana panels for deps, etc.)** — out of scope per the brief;
  GitHub-native + the existing Telegram bot only.
- **Auto-*deploying* compose-image bumps** — out of scope; compose is manual infra (reality #3).
  Renovate only opens the repo PR; the VPS sync stays a human step.

---

## 3. Architecture

```
                 ┌─────────────────────────── GitHub-native ───────────────────────────┐
 npm / Docker /  │  Renovate (self-hosted Action, weekly) ── PRs ──▶ ci.yml ──▶ merge   │
 Actions /       │      └ low-risk tiers: native auto-merge on green                     │
 compose tags    │  Dependabot Alerts (graph) ─────────────▶ Security tab + email        │
                 │  Trivy (Action, nightly) ── SARIF ──────▶ Security ▸ Code scanning     │
                 │      └ HIGH/CRIT in app image/fs ─ fail ─▶ GitHub notify + Telegram    │
                 │  npm audit (ci.yml, sync) ── HIGH/CRIT ─▶ BLOCKS build/deploy          │
                 └───────────────────────────────────────────────────────────────────────┘
```

Four independent signals, each matched to its domain; no shared always-on service.

---

## 4. Components — precise spec

### 4.1 Renovate

**`renovate.json`** (repo root). Key settings:

```jsonc
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":dependencyDashboard", "docker:pinDigests"],
  "timezone": "Asia/Yekaterinburg",
  "schedule": ["before 6am on monday"],          // weekly, low-noise (D5)
  "prConcurrentLimit": 8,
  "rangeStrategy": "pin",                          // never widen an exact pin (reality #1)
  "lockFileMaintenance": { "enabled": true, "schedule": ["before 6am on monday"] },
  "vulnerabilityAlerts": { "labels": ["security"], "automerge": false },  // Renovate raises CVE PRs (D3)
  "major": { "dependencyDashboardApproval": true },                       // majors are opt-in (D5)
  "packageRules": [
    // ── Automerge tier (D5): only low-risk classes, gated on green ci.yml ──
    { "matchManagers": ["github-actions"], "automerge": true },
    { "matchDepTypes": ["devDependencies"], "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    { "matchUpdateTypes": ["lockFileMaintenance"], "automerge": true },

    // ── Manual-only tiers (D5) ──
    { "matchDepTypes": ["dependencies"], "automerge": false },            // prod deps: always review
    { "matchDatasources": ["docker"], "automerge": false },              // base/compose images: review
    { "matchUpdateTypes": ["major"], "automerge": false },

    // ── Ignore the migration-coupled stateful images (D4) ──
    { "matchDatasources": ["docker"],
      "matchPackageNames": [
        "public.ecr.aws/supabase/postgres",
        "public.ecr.aws/supabase/gotrue",
        "public.ecr.aws/supabase/storage-api"
      ],
      "enabled": false }
  ],
  "platformAutomerge": true                         // use GitHub native auto-merge (needs D10)
}
```

Notes:
- `rangeStrategy: "pin"` + already-pinned manifest ⇒ Renovate emits exact→exact bumps, honoring
  the HARD RULE. (Verified mentally against `package.json`: 0 ranges today.)
- `config:recommended` already covers `npm`, `dockerfile`, `docker-compose`, and
  `github-actions` managers — no manager config needed.
- `docker:pinDigests` pins image tags to digests for stronger supply-chain integrity (optional;
  can drop if digest churn is noisy).
- Dependency Dashboard (a tracking issue) gives a single at-a-glance board — good operability +
  reviewer signal.

**`.github/workflows/renovate.yml`** — self-hosted runner (D1/D2):

```yaml
name: Renovate
on:
  schedule: [{ cron: '0 1 * * 1' }]   # Mon 01:00 UTC (~06:00 Yekaterinburg)
  workflow_dispatch:
    inputs:
      logLevel: { description: 'Renovate log level', default: 'info' }
concurrency: { group: renovate, cancel-in-progress: false }
jobs:
  renovate:
    runs-on: ubuntu-latest
    steps:
      - uses: renovatebot/github-action@v40   # pin to a digest/exact in impl
        with:
          token: ${{ secrets.RENOVATE_TOKEN }}
          configurationFile: renovate.json
        env:
          RENOVATE_REPOSITORIES: devmildfire/bookstore-app
          LOG_LEVEL: ${{ inputs.logLevel || 'info' }}
```

**Pre-req fix:** `deploy/production/docker-compose.yml` uses `cloudflare/cloudflared:latest`.
Renovate can't track a moving `latest` tag — pin it to the current explicit version first
(otherwise it's silently unmonitored). Confirm `nginx` / `kong` / `postgrest` / `postgres-meta`
/ `studio` carry trackable tags (they do).

### 4.2 Dependabot (alerts only — D3)

No file. Repo Settings → **Code security and analysis**:
- **Dependency graph**: ON (default for public repos).
- **Dependabot alerts**: ON.
- **Dependabot security updates**: **OFF** (Renovate raises the fix PRs).

Result: GitHub's Security dashboard + email for new CVEs; Renovate does the PR.

### 4.3 Trivy

**`.github/workflows/trivy.yml`** — nightly + manual (D6/D7/D8):

```yaml
name: Trivy
on:
  schedule: [{ cron: '0 3 * * *' }]   # nightly 03:00 UTC
  workflow_dispatch:
permissions:
  contents: read
  security-events: write              # SARIF upload to Code scanning
jobs:
  # ── Gating: our app image + repo filesystem ──
  app-image:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Trivy — app image (gate HIGH/CRIT)
        uses: aquasecurity/trivy-action@<pin>
        with:
          image-ref: ghcr.io/devmildfire/bookstore-app:latest
          format: sarif
          output: trivy-app.sarif
          severity: HIGH,CRITICAL
          exit-code: '1'              # FAIL on HIGH/CRITICAL
          ignore-unfixed: true        # only actionable (a fix exists)
      - if: always()
        uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: trivy-app.sarif, category: trivy-app-image }
      - name: Notify Telegram on failure (CRITICAL)         # D8
        if: failure()
        env:
          TG_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TG_CHAT: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: |
          curl -fsS "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
            -d chat_id="${TG_CHAT}" \
            -d text="🛑 Trivy: HIGH/CRITICAL in bookstore-app image — ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"

  filesystem:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: Trivy — fs (vuln + misconfig + secret)
        uses: aquasecurity/trivy-action@<pin>
        with:
          scan-type: fs
          scanners: vuln,misconfig,secret
          format: sarif
          output: trivy-fs.sarif
          severity: HIGH,CRITICAL
          exit-code: '1'
      - if: always()
        uses: github/codeql-action/upload-sarif@v3
        with: { sarif_file: trivy-fs.sarif, category: trivy-fs }
      # (same Telegram-on-failure step)

  # ── Informational: the prod Supabase images, no gate (D6) ──
  supabase-images:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        image:
          - public.ecr.aws/supabase/postgres:17.6.1.106
          - public.ecr.aws/supabase/gotrue:v2.188.1
          - public.ecr.aws/supabase/storage-api:v1.54.1
          - public.ecr.aws/supabase/postgrest:v14.10
          - public.ecr.aws/supabase/postgres-meta:v0.96.4
          - kong/kong:3.9.1
    steps:
      - name: Trivy — ${{ matrix.image }} (report only)
        uses: aquasecurity/trivy-action@<pin>
        with:
          image-ref: ${{ matrix.image }}
          format: table
          severity: HIGH,CRITICAL
          exit-code: '0'              # never fail (third-party + pinned)
          output: trivy-${{ strategy.job-index }}.txt
      - name: Publish to job summary
        if: always()
        run: { ... cat report into $GITHUB_STEP_SUMMARY ... }
      - uses: actions/upload-artifact@v7
        with: { name: trivy-supabase-${{ strategy.job-index }}, path: 'trivy-*.txt' }
```

Notes:
- `ignore-unfixed: true` on the gating scans → only fail when a fix is actually available
  (avoids blocking on un-actionable CVEs). The informational job keeps unfixed too (full
  visibility).
- The image is `:latest` (pushed by `ci.yml`'s build job on main). The Supabase image list is
  kept in sync with `docker-compose.yml` (a small drift risk — call it out in the file comment;
  Renovate updates the compose tags, this list is updated in the same PR by hand. `ponytail:`
  duplicated list, dedupe via a parsed compose only if it churns).

### 4.4 npm audit gate (unchanged — D9)

`audit-reusable.yml` stays exactly as-is (sync gate in `ci.yml` + the deploy path). No change;
documented here so the full picture is in one place.

### 4.5 Branch protection on `main` (D10)

Settings → Branches → add a rule for `main`:
- **Require status checks to pass before merging** — required contexts (exact strings appear
  after the first PR run; expected: `audit / npm-audit`, `Lint & build check`, `unit / unit`,
  `integration / integration`, `build / build-and-push`, `e2e / Playwright E2E`).
- **Require branches to be up to date before merging.**
- Do **not** require linear history / signed commits (not used today).
- Repo setting → **Allow auto-merge: ON**; **Automatically delete head branches: ON**.

> ⚠ This ends direct `git push origin main`. New flow: branch → PR → green `ci.yml` → merge
> (Renovate auto-merges its low-risk tier; you merge yours). Promotion to prod is unchanged
> (`git push origin main:production`). Update [docs/deployment/github-actions-ci-cd.md] +
> [README.md] to describe the PR-based trunk flow when this lands.

---

## 5. Secrets to add (repo → Settings → Secrets and variables → Actions)

| Secret | For | Notes |
|--------|-----|-------|
| `RENOVATE_TOKEN` | Renovate Action | Fine-grained PAT, **this repo only**, `contents: write` + `pull-requests: write`. Set a calendar reminder for expiry (D2). |
| `TELEGRAM_BOT_TOKEN` | Trivy → Telegram | Same bot as the monitoring stack (token currently only on the VPS in `monitoring/alertmanager/telegram_token`). |
| `TELEGRAM_CHAT_ID` | Trivy → Telegram | The existing alert chat. |

---

## 6. Implementation phases & tracker

Legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

### Phase 0 — Pre-reqs (no behavior change)
- [ ] Pin `cloudflare/cloudflared:latest` → explicit version in `deploy/production/docker-compose.yml`.
- [ ] Create the fine-grained PAT; add `RENOVATE_TOKEN` secret.
- [ ] Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` secrets (from the VPS bot).

### Phase 1 — Renovate (PRs only, automerge OFF initially)
- [ ] Add `renovate.json` (automerge rules present but `platformAutomerge: false` for the first run).
- [ ] Add `.github/workflows/renovate.yml`.
- [ ] Manual `workflow_dispatch`; confirm the Dependency Dashboard issue + the first onboarding PR.
- [ ] Verify a Renovate PR **triggers `ci.yml`** (proves the PAT identity works).

### Phase 2 — Dependabot alerts
- [ ] Enable Dependency graph + Dependabot alerts; confirm Security updates are OFF.

### Phase 3 — Trivy
- [ ] Add `.github/workflows/trivy.yml` (app image + fs gating, Supabase informational).
- [ ] `workflow_dispatch` run; confirm SARIF appears in Security ▸ Code scanning.
- [ ] Force a failure path (e.g. temporarily lower severity) → confirm the Telegram message.

### Phase 4 — Branch protection + automerge (the disruptive step, last)
- [ ] Enable branch protection on `main` with the required checks (§4.5).
- [ ] Turn on repo Allow-auto-merge + delete-on-merge.
- [ ] Flip `platformAutomerge: true` in `renovate.json`; verify a low-risk PR (e.g. an Actions
      bump) auto-merges on green and a prod-dep PR does **not**.
- [ ] Update `docs/deployment/github-actions-ci-cd.md` + `README.md` for the PR-based trunk flow.

### Phase 5 — Docs
- [ ] Mark this plan done; add a short "Dependency monitoring" section to `docs/deployment/`
      (or a `docs/security/` note) describing the four signals + the weekly/monthly review ritual.

---

## 7. Maintenance policy

- **Weekly** — triage the Renovate Dependency Dashboard; merge safe non-automerged PRs;
  glance at any new Code-scanning findings.
- **Monthly** — review held major upgrades (dashboard-approval gated); decide Node LTS / base
  image moves; check the `RENOVATE_TOKEN` expiry.
- **On a stateful-image advisory** (postgres/gotrue/storage-api flagged by the informational
  Trivy job) — schedule a **rehearsed restore** + version bump per
  [supabase-production-bootstrap.md](../deployment/supabase-production-bootstrap.md); never a
  drive-by merge.

---

## 8. Success criteria (maps to the brief)

Automatically detected, with the mechanism:

| Detect | Mechanism |
|--------|-----------|
| Outdated npm packages | Renovate PRs |
| Vulnerable npm packages | Dependabot alerts + Renovate vuln PRs + `npm audit` gate |
| Outdated Docker base image | Renovate (`dockerfile` manager) |
| Vulnerable OS packages (our image) | Trivy app-image scan (gates) |
| Vulnerable OS packages (Supabase stack) | Trivy informational matrix |
| Outdated GitHub Actions | Renovate (`github-actions` manager, automerged) |
| Outdated compose images | Renovate (stateless set; stateful trio intentionally excluded) |
| Newly disclosed CVEs after deploy | Dependabot alerts (continuous) + nightly Trivy |

Developer effort reduces to: review PRs + occasional security findings.
