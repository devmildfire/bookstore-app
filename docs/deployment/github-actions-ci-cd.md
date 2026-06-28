# GitHub Actions CI/CD

How `bookstore-app` is tested and deployed to the VPS. The pipeline is consolidated:
**tests run once, the image is built once, and that same image is promoted to prod** —
no re-testing on the deploy side.

## Branch model

| Branch | Purpose | Deploys? |
| --- | --- | --- |
| `feature/**`, `feat/**` | Development work | No |
| `main` | **Protected** trunk. Full CI; builds + pushes the tested image. | No (builds only) |
| `production` | Exact mirror of `main`, deploy-only. | Yes |

```text
feature branch -> PR -> main (full CI + image build) -> production (promote + deploy)
```

> **`main` is branch-protected** (required status checks = all `ci.yml` jobs; up-to-date required;
> enforced for admins too). **There is no direct push to `main`** — every change, including the
> owner's, lands via a PR that passes CI. No required reviews (solo repo), so a green PR can
> self-merge. Renovate's low-risk tier auto-merges on green (see [dependency-monitoring.md](../plans/dependency-monitoring.md)).

`main` is the single source of truth and stays identical to `production` at all times —
`production` is just `main` with a deploy trigger attached. Promote by pushing `main` onto
`production`:

```bash
git push origin main:production
```

A fast-forward push keeps `production` an exact mirror; a `--no-ff` merge also works (the
deploy workflow's SHA resolver handles both). There is no staging server, no `update`/
`master` integration branch.

## Workflows

### `ci.yml` — the pipeline (push + PR to `main`)

One ordered pipeline; later jobs `need` the earlier ones:

```text
audit → lint → unit → integration → build → e2e
```

- **audit** — `npm audit --audit-level=high` (reusable `audit-reusable.yml`). Fails only on
  high/critical advisories (transitive moderate/low from the dev `supabase` CLI are tolerated).
- **lint** — `npm run lint`. On **PRs only** it also runs `npm run build` as a compile check
  (on `main` pushes the image build below runs `next build` itself, so a second build here
  would be redundant).
- **unit** — `test-unit-reusable.yml` (Vitest, pure, no infra).
- **integration** — `test-integration-reusable.yml` (Vitest against a local Supabase stack;
  `needs: unit`).
- **build** — `build-push-reusable.yml`. Builds the Docker image and pushes `:<git-sha>` (on
  PRs too, so e2e can pull it); pushes `:latest` only on a canonical `main` push. `needs:
  [audit, lint, unit, integration]`.
- **e2e** — `test-e2e-reusable.yml`, run **against the built image** (`docker run` the real
  standalone image + local Supabase stack, Playwright drives it), not `next dev`. `needs: build`.

The image `main` produces is therefore fully tested by the time it exists. Because e2e runs
*after* build, an image tag existing no longer implies e2e passed — so the deploy gate checks
the **CI run's conclusion**, not image existence (see below).

### `deploy-production.yml` — promote + deploy (push to `production`)

Deploy-**only**. No rebuild, no re-test. Jobs:

1. **Resolve the main SHA** — for a fast-forward push, `HEAD` is the main commit; for a
   `--no-ff` merge promote, parent 2 is the main commit.
2. **Require green CI for this SHA** — `gh run list --commit <sha> --workflow=ci.yml`; refuses
   to deploy unless that run's conclusion is `success`.
3. **Promote the pre-built image** — `docker pull <image>:<sha>` (fails the deploy if `main`
   CI never built it), retag `:production`, push.
4. **Roll the app over SSH** — `docker compose pull app && docker compose up -d app` on the VPS.

This **rolls the app image only** — it does not sync `/opt/chtivo` infra files
(`docker-compose.yml`/`.env`/`nginx`/`volumes`). Those are synced by hand; see
[deploy/production/README.md](../../deploy/production/README.md) → "Deploy model".

### Feature-branch feedback

- **`audit.yml`** — runs the audit on every branch push *except* `main`/`production`.
- **`test-e2e.yml`** — runs e2e on `feature/**` / `feat/**` pushes (PRs into `main` get e2e
  inside `ci.yml` instead).

### Scheduled / on-demand (dependency monitoring)

- **`renovate.yml`** — self-hosted Renovate, weekly + manual dispatch. Opens dependency-update +
  digest-pin PRs (npm, Docker, Actions); the low-risk tier auto-merges on green.
- **`trivy.yml`** — nightly + manual. Scans the deployed `:production` image + repo filesystem,
  **gating on HIGH/CRITICAL** → SARIF in Security ▸ Code scanning; a CRITICAL also pages Telegram.
  `:latest` + the Supabase images are scanned informationally.

Full design + the review ritual: [docs/plans/dependency-monitoring.md](../plans/dependency-monitoring.md).

## Single env-agnostic image

The image bakes **nothing** environment-specific (no Supabase host/key). The browser talks to
its own origin under `/sb` (proxied to Supabase + anon key injected by `src/proxy.ts`);
Supabase config + the app origin are **runtime** env. So the exact image CI tested against the
local stack is the one promoted to prod. The image build takes `SUPABASE_INTERNAL_URL` +
`NEXT_PUBLIC_BASE_URL` as build args and the anon key via a BuildKit **secret mount** (never an
`ARG`/`ENV` — avoids `SecretsUsedInArgOrEnv`). Full design:
[docs/plans/cicd-single-image-and-edge-tests.md](../plans/cicd-single-image-and-edge-tests.md).

## GitHub secrets

| Secret | Purpose |
| --- | --- |
| `VPS_HOST` | VPS IP or DNS alias (secret — never in docs) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private key for deploy-only SSH access |
| `VPS_SSH_PORT` | Usually `22` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key — fed to the image build (secret mount) + the PR validate-build |
| `RENOVATE_TOKEN` | Renovate's fine-grained PAT (repo-scoped) so its PRs trigger `ci.yml` — perms in [dependency-monitoring.md](../plans/dependency-monitoring.md) §5 |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | Trivy CRITICAL→Telegram (same bot as the monitoring stack) |

The GHCR image is **public** (`ghcr.io/devmildfire/bookstore-app`), so the VPS pulls
anonymously; the deploy job logs in to GHCR only to *push* the promoted `:production` tag.
Production app secrets live in `/opt/chtivo/.env` on the VPS (strict perms), not synced on every
deploy.

## VPS SSH key policy

A dedicated deploy key for GitHub Actions: belongs only to the deploy pipeline, restricted to
the `deploy` user, removable without affecting personal SSH, never reused for local dev.

## Image tags & rollback

Immutable `:<git-sha>` for reliable rollbacks; moving `:production` for the running release.
Roll back by retagging a previous known-good SHA, or set `APP_IMAGE` in `/opt/chtivo/.env` to
a previous `:<sha>` and `docker compose up -d app`. (See TRACKER §5 "Rollback".)

## Status

- [x] `ci.yml` consolidated pipeline (audit → lint → unit → integration → build → e2e).
- [x] `deploy-production.yml` — promote-only, gated on the SHA's green CI run.
- [x] Single env-agnostic image (same-origin `/sb`), live in prod 2026-06-26.
- [x] GHCR public; VPS pulls anonymously; deploy SSH key + prod compose on the VPS.
- [~] Post-deploy HTTP smoke check still deferred — the workflow prints `docker compose ps app`
  only (see TRACKER §5).
