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
| D2 | **Fine-grained PAT** (`RENOVATE_TOKEN`), repo-scoped (full permission set in §5 — `contents/pull-requests/issues/workflows: write` + `checks`/`Dependabot alerts: read`) | Simpler than a dedicated GitHub App; sufficient for self-hosted Renovate. Critically: a non-`GITHUB_TOKEN` identity is **required** so Renovate's PRs trigger `ci.yml` (GitHub suppresses workflow triggers from `GITHUB_TOKEN`), which the automerge-on-green tier depends on. `workflows: write` is required for the Actions digest-pin PRs. Cost: account-bound, manual expiry — tracked in the maintenance policy. |
| D3 | **Renovate is the single PR source**; Dependabot **Alerts ON, Security Updates OFF** | Both bots can raise CVE-fix PRs; running both = duplicate PRs. Renovate raises everything (incl. `vulnerabilityAlerts`); Dependabot's alert graph stays for the native Security dashboard + email. No `dependabot.yml` (that file is for *version* updates, which Renovate owns). |
| D4 | Renovate manages **stateless** compose images; **ignores** `postgres`/`gotrue`/`storage-api` | Those three are coupled to the restored dump + migration state — see [deploy/production/README.md](../../deploy/production/README.md) "Version pinning rationale". A bump requires a rehearsed restore, so it must never arrive as an auto-PR. |
| D5 | **Limited automerge**, gated on green `ci.yml` | Risk-tiered: automerge only GitHub Actions updates, devDependency patch/minor, and lockfile maintenance — *because* the unit+integration+e2e suite gates them. App deps (any), majors, and all Docker/base/compose bumps stay manual PRs. Ties the real test suite into the update flow. |
| D6 | **Trivy** scans the **deployed** image `:production` (gates HIGH/CRIT) + the next-trunk image `:latest` (informational) + filesystem (misconfig + secrets) + Supabase images (**informational**) | "Detect CVEs after deployment" means scanning *what is actually running* — that is `:production` (a promoted SHA that can lag `main` or be rolled back), **not** `:latest` (only the newest main build). `:latest` is scanned too as early warning for the next promote. App image + repo are what we can fix → they gate; `:latest` + Supabase images are third-party/pinned/not-yet-deployed → report-only. |
| D7 | Trivy findings → **SARIF to GitHub Security** (Code scanning) | Repo is public, so Code scanning is free. Browsable/dismissable/historical, dedups with Dependabot — the idiomatic GitHub-native integration. |
| D8 | GitHub fails+notifies on **HIGH/CRITICAL**; **Telegram pages on CRITICAL only** | We don't *ship* a HIGH/CRITICAL build (gate fails → GitHub email/notification covers HIGH). But the existing Telegram channel is reserved for things that warrant interrupting you — so only **CRITICAL** mirrors there, alongside the SLO alerts. A dedicated CRITICAL-severity Trivy pass drives the page (see §4.3). |
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
  "extends": [
    "config:recommended",
    ":dependencyDashboard",
    "docker:pinDigests",                  // pin Docker tags → digests (node, nginx, etc.)
    "helpers:pinGitHubActionDigests"      // pin Actions @vN → digest (integrity parity)
  ],
  "timezone": "Asia/Yekaterinburg",
  "schedule": ["before 6am on monday"],          // weekly, low-noise (D5)
  "prConcurrentLimit": 8,
  "rangeStrategy": "pin",                          // never widen an exact pin (reality #1)
  "lockFileMaintenance": { "enabled": true, "schedule": ["before 6am on monday"] },
  "vulnerabilityAlerts": { "labels": ["security"], "automerge": false },  // Renovate raises CVE PRs (D3)
  "major": { "dependencyDashboardApproval": true },                       // majors are opt-in (D5)
  "packageRules": [
    // ── PHASE 4 ONLY — automerge tier (D5). Left COMMENTED OUT so this snippet is the safe Phase-1
    //    config (`automerge: true` merges via Renovate's own API once checks pass even with
    //    `platformAutomerge: false`). Uncomment these THREE rules in Phase 4, after main is protected. ──
    // { "matchManagers": ["github-actions"], "automerge": true },
    // { "matchDepTypes": ["devDependencies"], "matchUpdateTypes": ["patch", "minor"], "automerge": true },
    // { "matchUpdateTypes": ["lockFileMaintenance"], "automerge": true },

    // ── Manual-only tiers (D5) — present from Phase 1 (these are all automerge:false) ──
    { "matchDepTypes": ["dependencies"], "automerge": false },            // prod deps: always review
    { "matchDatasources": ["docker"], "automerge": false },              // base/compose images: review
    { "matchUpdateTypes": ["major"], "automerge": false },

    // ── Migration-coupled stateful images (D4): block version + digest UPDATES, but ALLOW the
    //    one-time digest PIN so the exact approved image is locked by sha. Version moves
    //    only ever happen via the rehearsed-restore process, never an auto-PR. ──
    { "matchDatasources": ["docker"],
      "matchPackageNames": [
        "public.ecr.aws/supabase/postgres",
        "public.ecr.aws/supabase/gotrue",
        "public.ecr.aws/supabase/storage-api"
      ],
      "matchUpdateTypes": ["major", "minor", "patch", "digest"],         // pinDigest is NOT listed → still allowed
      "enabled": false }
  ],
  "platformAutomerge": false                        // Phase 4: flip to true (GitHub-native auto-merge). NOTE: this is NOT the automerge on/off switch — see the packageRules note above.
}
```

Notes:
- **Automerge is governed by the `automerge` packageRules, not `platformAutomerge`.** Phase 1 ships
  *without* the three `automerge: true` rules; Phase 4 adds them once `main` is protected and flips
  `platformAutomerge: true` so the merge uses GitHub-native auto-merge.
- The stateful trio still gets a one-time **digest-pin** PR (safe — same image, locked by sha); only
  *version* and *digest-update* PRs are suppressed.
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
  packages: read                      # pull :production / :latest from GHCR (matches ci.yml's e2e job)
  security-events: write              # SARIF upload to Code scanning
jobs:
  # ── Gating: the DEPLOYED image (:production), HIGH/CRIT gate, CRITICAL→Telegram (D6/D8) ──
  app-image:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: GHCR login                       # :production is public but GHCR wants a token
        uses: docker/login-action@v4
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }

      # 1) Visibility: scan once → SARIF, never aborts (exit-code 0).
      - name: Trivy — :production → SARIF
        uses: aquasecurity/trivy-action@<pin>
        with:
          image-ref: ghcr.io/devmildfire/bookstore-app:production
          format: sarif
          output: trivy-prod.sarif
          severity: HIGH,CRITICAL
          ignore-unfixed: true                 # only actionable (a fix exists)
          exit-code: '0'
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: { sarif_file: trivy-prod.sarif, category: trivy-prod-image }

      # 2) CRITICAL-only pass drives the Telegram page (D8). DB is cached → cheap re-scan.
      - name: Trivy — :production CRITICAL check
        id: crit
        continue-on-error: true
        uses: aquasecurity/trivy-action@<pin>
        with: { image-ref: ghcr.io/devmildfire/bookstore-app:production, severity: CRITICAL, ignore-unfixed: true, exit-code: '1', format: table }
      - name: Telegram page — CRITICAL only
        if: steps.crit.outcome == 'failure'
        env: { TG_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}, TG_CHAT: ${{ secrets.TELEGRAM_CHAT_ID }} }
        run: |
          curl -fsS "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
            -d chat_id="${TG_CHAT}" \
            -d text="🛑 Trivy: CRITICAL CVE in DEPLOYED image (:production) — ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"

      # 3) Gate: fail the job (→ GitHub email/notification) on HIGH *or* CRITICAL.
      - name: Trivy — :production gate (HIGH,CRITICAL)
        uses: aquasecurity/trivy-action@<pin>
        with: { image-ref: ghcr.io/devmildfire/bookstore-app:production, severity: HIGH,CRITICAL, ignore-unfixed: true, exit-code: '1', format: table }
    # ponytail: 3 Trivy passes share a cached DB; if it ever drags, collapse to one JSON + jq.

  # ── Filesystem: misconfig + secret + vuln. REPORT-ONLY until a baseline is committed. ──
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
          trivyignores: .trivyignore          # commit an EMPTY .trivyignore with this workflow so the input resolves; populate after the baseline triage
          exit-code: '0'                       # Phase 3a: 0 (report-only). Phase 3b: flip to 1 to gate.
      - uses: github/codeql-action/upload-sarif@v3
        if: always()
        with: { sarif_file: trivy-fs.sarif, category: trivy-fs }

  # ── Informational (NO gate, D6): next-promote image :latest + the third-party Supabase stack ──
  informational-images:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        image:
          - ghcr.io/devmildfire/bookstore-app:latest      # early warning for the next promote
          - public.ecr.aws/supabase/postgres:17.6.1.106
          - public.ecr.aws/supabase/gotrue:v2.188.1
          - public.ecr.aws/supabase/storage-api:v1.54.1
          - public.ecr.aws/supabase/postgrest:v14.10
          - public.ecr.aws/supabase/postgres-meta:v0.96.4
          - kong/kong:3.9.1
    steps:
      - name: GHCR login                       # for the :latest entry
        uses: docker/login-action@v4
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - name: Trivy — ${{ matrix.image }} (report only)
        uses: aquasecurity/trivy-action@<pin>
        with: { image-ref: ${{ matrix.image }}, format: table, severity: HIGH,CRITICAL, exit-code: '0', output: report.txt }
      - name: Publish to job summary
        if: always()
        run: cat report.txt >> "$GITHUB_STEP_SUMMARY"
```

Notes:
- `ignore-unfixed: true` on the gating scans → only fail when a fix is actually available
  (avoids blocking on un-actionable CVEs). The informational job keeps unfixed too (full
  visibility).
- The gated image is `:production` (the SHA actually promoted + running on the VPS — `:latest`
  only tracks the newest main build and ignores rollbacks). `:latest` is scanned informationally
  as early warning for the next promote.
- The informational image list mirrors `docker-compose.yml` by hand (a small drift risk — note
  it in the file comment; Renovate bumps the compose tags, this list updates in the same PR).
  `ponytail:` duplicated list, dedupe via a parsed compose only if it churns.

### 4.4 npm audit gate (unchanged — D9)

`audit-reusable.yml` stays exactly as-is (sync gate in `ci.yml` + the deploy path). No change;
documented here so the full picture is in one place.

### 4.5 Branch protection on `main` (D10)

Settings → Branches → add a rule for `main`:
- **Require status checks to pass before merging.** ⚠ Because `ci.yml` uses *reusable* workflows,
  the visible check-context strings are not reliably guessable (they render as caller/inner and
  can vary). **Do not hard-code them** — open one throwaway PR, let `ci.yml` run, then in the
  branch-protection UI **select the exact contexts from the list it presents** (the jobs we want:
  audit, lint, unit, integration, build, e2e).
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
| `RENOVATE_TOKEN` | Renovate Action | Fine-grained PAT, **this repo only**. Permissions: `contents: write` (push branches), `pull-requests: write` (open PRs), `issues: write` (Dependency Dashboard issue), `workflows: write` (**required** — Renovate edits `.github/workflows/*` for the Actions digest pins; GitHub blocks workflow-file pushes without it), `checks: read` (read CI status for automerge), and `Dependabot alerts: read` if the fine-grained UI exposes it (for `vulnerabilityAlerts`). Set a calendar reminder for expiry (D2). |
| `TELEGRAM_BOT_TOKEN` | Trivy → Telegram | Same bot as the monitoring stack (token currently only on the VPS in `monitoring/alertmanager/telegram_token`). |
| `TELEGRAM_CHAT_ID` | Trivy → Telegram | The existing alert chat. |

---

## 6. Implementation phases & tracker

Legend: `[ ]` pending · `[~]` in progress · `[x]` done · `[!]` blocked

### Phase 0 — Pre-reqs (no behavior change)
- [x] Pin `cloudflare/cloudflared` → `2026.6.0` in `deploy/production/docker-compose.yml` (the version
      currently running in prod; no behavior change). *(VPS compose copy still says `:latest` — syncs on
      the next manual infra push; the repo file is what Renovate reads.)*
- [ ] Create the fine-grained PAT; add `RENOVATE_TOKEN` secret. **← only remaining Phase 0 item (needs you).**
- [x] Add `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` secrets — set from the VPS bot (2026-06-27).

### Phase 1 — Renovate (PRs only, NO automerge)
- [ ] Add `renovate.json` exactly as in §4.1 — the three `automerge: true` rules stay **commented
      out** and `platformAutomerge: false`. (Both matter — `automerge: true` alone would let Renovate
      merge via its own API before `main` is protected.) The `automerge: false` manual-tier
      rules stay active.
- [ ] Add `.github/workflows/renovate.yml`.
- [ ] Manual `workflow_dispatch`; confirm the Dependency Dashboard issue + the first onboarding PR.
- [ ] Verify a Renovate PR **triggers `ci.yml`** (proves the PAT identity works).
- [ ] **Acceptance — digest pinning lands:** merge Renovate's first digest-pin PRs
      so `node:22-alpine`, the compose tags (`nginx`, `kong`, …), and the GitHub Actions (`@vN`)
      are pinned to immutable digests. Without this the "same source → same image" guarantee in the
      CI/CD docs is weaker than claimed.

### Phase 2 — Dependabot alerts
- [ ] Enable Dependency graph + Dependabot alerts; confirm Security updates are OFF.

### Phase 3 — Trivy
**3a — report-only baseline (no gate yet):**
- [ ] Add `.github/workflows/trivy.yml` with the **filesystem** scan at `exit-code: 0` and the
      `:production` image scan present. **Commit an empty `.trivyignore` in the same change** so the
      `trivyignores:` input resolves on the first run.
- [ ] `workflow_dispatch` run; triage the first filesystem findings (misconfig/secret false
      positives are expected from docs/test fixtures + IaC).
- [ ] Populate `.trivyignore` (and/or `trivy.yaml`) with the accepted/handled findings.
- [ ] Confirm SARIF appears in **Security ▸ Code scanning** for both `trivy-prod-image` + `trivy-fs`.

**3b — turn the gates on:**
- [ ] Flip the filesystem scan to `exit-code: 1`.
- [ ] Confirm the `:production` HIGH/CRITICAL gate fails the job as designed.
- [ ] Force a CRITICAL (e.g. a known-vulnerable test image) → confirm the **Telegram page fires on
      CRITICAL only**, and that a HIGH-only finding fails the job but does **not** page Telegram.
- [ ] Confirm the informational job (`:latest` + Supabase images) never fails the run.

### Phase 4 — Branch protection + automerge (the disruptive step, last)
- [ ] Enable branch protection on `main` with the required checks (§4.5).
- [ ] Turn on repo Allow-auto-merge + delete-on-merge.
- [ ] **Uncomment** the three `automerge: true` packageRules **and** flip `platformAutomerge: true` in
      `renovate.json`; verify a low-risk PR (e.g. an Actions bump) auto-merges on green and a prod-dep
      PR does **not**.
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
| Vulnerable OS packages (deployed image) | Trivy `:production` scan (gates HIGH/CRIT) |
| Vulnerable OS packages (Supabase stack) | Trivy informational matrix |
| Outdated GitHub Actions | Renovate (`github-actions` manager, automerged) |
| Outdated compose images | Renovate — stateless set gets version updates; the stateful trio gets a digest pin only (version moves stay manual via rehearsed restore) |
| Newly disclosed CVEs after deploy | Dependabot alerts (continuous) + nightly Trivy on `:production` |

Developer effort reduces to: review PRs + occasional security findings.
