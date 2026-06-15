# GitHub Actions CI/CD Plan

This document defines the intended CI/CD flow for deploying `bookstore-app` to the VPS.

## Branch Model

| Branch type | Purpose | Deploys? |
| --- | --- | --- |
| Feature branches | Development work | No |
| `master` | Integration branch, CI/e2e validation | No |
| `production` | Production release branch | Yes |

Target workflow:

```text
feature branch -> PR -> master -> validation -> PR/merge to production -> deploy
```

There is no staging server. Production deploys must only happen from `production`.

## Workflows

### 1. CI Workflow

Trigger:

- pull requests into `master`;
- pushes to `master`;
- optionally pull requests into `production`.

Required jobs:

- install dependencies with `npm ci`;
- lint with `npm run lint`;
- build with `npm run build`;
- run e2e tests once an e2e suite exists.

Notes:

- The Next.js build may fetch Google font assets. CI must have outbound network access.
- No production deployment happens from this workflow.

### 2. Production Image Workflow

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

### 3. VPS Deploy Workflow

Trigger:

- after successful production image push.

Deployment method:

- GitHub Actions SSHes into the VPS as `deploy`;
- VPS logs into GHCR if required;
- VPS updates `/opt/chtivo/.env` only through pre-existing server-side secrets, not by committing secrets;
- VPS runs Docker Compose to pull and restart the Next.js app service.

Target deploy command shape:

```bash
cd /opt/chtivo
docker compose pull bookstore-app
docker compose up -d bookstore-app nginx
docker compose ps
```

The exact command will be finalized after the production compose file exists.

## GitHub Secrets

Required GitHub repository secrets:

| Secret | Purpose |
| --- | --- |
| `VPS_HOST` | `<vps-ip>` or DNS alias |
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

Rollback target:

```bash
cd /opt/chtivo
# set image tag back to previous known-good image
docker compose up -d bookstore-app
```

The exact rollback command depends on how image tags are injected into compose.

## Initial Implementation Tasks

- Create `.github/workflows/ci.yml`.
- Create `.github/workflows/deploy-production.yml`.
- Configure GHCR permissions.
- Add VPS deploy SSH key to GitHub secrets.
- Create production compose file on VPS.
- Decide whether the workflow updates compose image tags or the VPS uses `bookstore-app:production`.
- Add smoke checks after deploy:
  - `https://bookstore-app.mildfire.dev`;
  - selected public storage URL;
  - auth endpoint through `api.mildfire.dev`;
  - admin login page.
