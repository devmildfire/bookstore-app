# GitHub Actions CI/CD Plan

This document defines the intended CI/CD flow for deploying `bookstore-app` to the VPS.

## Branch Model

| Branch type | Purpose | Deploys? |
| --- | --- | --- |
| Feature branches | Development work | No |
| `update` | De-facto trunk / integration branch, CI validation | No |
| `production` | Production release branch (branched from `update`) | Yes |

> **Reality note:** the originally-planned `master` integration branch was never created.
> `update` is the trunk (hundreds of commits ahead of the stale `main`); `production`
> branches from `update`.

Actual workflow:

```text
feature branch -> PR -> update (trunk, CI) -> production -> deploy
```

There is no staging server. Production deploys must only happen from `production`.

## Workflows

### 1. CI Workflow — `.github/workflows/docker-publish.yml` (job name "CI")

Trigger (as implemented):

- pushes to `update`, `main`, `staging`;
- pull requests into `main`, `staging`.

Jobs (single `lint-and-build` job):

- install dependencies with `npm ci`;
- lint with `npm run lint`;
- build with `npm run build` (with `NEXT_PUBLIC_SUPABASE_URL` repo var + `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret);
- run e2e tests once an e2e suite exists (not yet present).

Notes:

- The Next.js build may fetch Google font assets. CI must have outbound network access.
- No production deployment happens from this workflow.
- Despite the filename `docker-publish.yml`, this workflow only lints + builds — it does **not**
  publish an image. Image build/push lives in the deploy workflow below.

> **Reality note:** the "Production Image Workflow" and "VPS Deploy Workflow" below are
> implemented as **one** file — `.github/workflows/deploy-production.yml` — with two jobs:
> `build-and-push` (builds + pushes the GHCR image) and `deploy` (`needs: build-and-push`,
> SSH-rolls the app on the VPS). They are documented separately here for clarity.

### 2. Production Image Workflow (job `build-and-push`)

Trigger:

- push to `production`;
- optional manual `workflow_dispatch`.

Required jobs:

1. Checkout repository.
2. Build Docker image using the repo `Dockerfile`.
3. Tag image:
   - `ghcr.io/devmildfire/bookstore-app:<git-sha>`
   - `ghcr.io/devmildfire/bookstore-app:production`
4. Push image to GitHub Container Registry.

### 3. VPS Deploy Workflow (job `deploy`)

Trigger:

- `needs: build-and-push` — runs after the image is pushed.

Deployment method:

- GitHub Actions SSHes into the VPS as `deploy` (using `VPS_SSH_KEY`);
- the GHCR image is **public**, so the VPS pulls anonymously (no GHCR login needed);
- the VPS does **not** rewrite `/opt/chtivo/.env` — secrets live there already (see the deploy-model split in `deploy/production/README.md`);
- Docker Compose pulls and restarts the `app` service only.

Implemented deploy command (the compose service is **`app`**, not `bookstore-app`):

```bash
cd /opt/chtivo
docker compose pull app
docker compose up -d app
docker image prune -f
docker compose ps app
```

**This rolls the app image only** — it does not sync `/opt/chtivo` infra files
(`docker-compose.yml`/`.env`/`nginx`/`volumes`). Those are synced by hand; see
`deploy/production/README.md` → "Deploy model".

## GitHub Secrets

Required GitHub repository secrets:

| Secret | Purpose |
| --- | --- |
| `VPS_HOST` | VPS IP or DNS alias (stored as a secret — never written into docs) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Private key for deploy-only SSH access |
| `VPS_SSH_PORT` | Usually `22` |
| `GHCR_TOKEN` | Optional if `GITHUB_TOKEN` is insufficient for package access |

Production application secrets should not be passed on every deploy unless there is a deliberate secret-sync workflow. Prefer storing production `.env` on the VPS with strict permissions and rotating it manually or through a separate controlled process.

## VPS SSH Key Policy

Use a dedicated deploy key for GitHub Actions. It should:

- belong only to GitHub Actions deployment;
- be restricted to the `deploy` user;
- be removable without affecting personal SSH access;
- not be reused for local development.

## Image Tags

Use immutable SHA tags for reliable rollbacks:

```text
ghcr.io/devmildfire/bookstore-app:<git-sha>
```

Also keep a moving production tag for convenience:

```text
ghcr.io/devmildfire/bookstore-app:production
```

The compose file should prefer a pinned SHA during deploy if the workflow writes or exports one, or use the `production` tag if simple deployment is preferred at first.

## Rollback Model

Every production deployment should record:

- git SHA;
- Docker image tag/digest;
- migration state;
- backup file if migrations were run;
- deploy timestamp.

Rollback target — set `APP_IMAGE` in `/opt/chtivo/.env` to the previous known-good
immutable SHA tag, then recreate the `app` service:

```bash
cd /opt/chtivo
# edit .env: APP_IMAGE=ghcr.io/devmildfire/bookstore-app:<previous-sha>
docker compose up -d app
```

Or re-run the deploy workflow from the known-good commit. (See TRACKER §5 "Rollback".)

## Implementation status

- [x] CI workflow — shipped as `.github/workflows/docker-publish.yml` (lint + build).
- [x] Production deploy workflow — `.github/workflows/deploy-production.yml` (build+push image, then SSH-roll `app`).
- [x] GHCR permissions configured; image is public (`ghcr.io/devmildfire/bookstore-app`), VPS pulls anonymously.
- [x] VPS deploy SSH key added to GitHub secrets (`VPS_SSH_KEY`).
- [x] Production compose file on VPS (`/opt/chtivo/docker-compose.yml`).
- [x] Image-tag strategy: compose pulls the rolling `:production` tag; immutable `:<git-sha>` kept for rollback.
- [~] Smoke checks after deploy — the workflow prints `docker compose ps app`; a real HTTP
  smoke check is still **deferred** (see TRACKER §5). Intended targets:
  - `https://bookstore-app.mildfire.dev`;
  - selected public storage URL;
  - auth endpoint through `api.mildfire.dev`;
  - admin login page.
