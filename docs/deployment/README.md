# Production Deployment Overview

This directory defines the production deployment plan for `bookstore-app` on a single VPS under the `mildfire.dev` Cloudflare zone. (The VPS host IP lives in the `VPS_HOST` GitHub secret / the VPS itself — it is deliberately kept out of these public docs.)

## Target Architecture

> As-built: **Cloudflare Tunnel is the only ingress** — `cloudflared` dials out, so the VPS
> publishes **no** public ports (UFW leaves only SSH open). The exhaustive, rehearsed as-built
> reference is [deploy/production/README.md](../../deploy/production/README.md); this file is the
> higher-level overview.

```text
Browser
  |
  v
Cloudflare DNS / TLS / WAF
  |
  v
Cloudflare Tunnel -> cloudflared (in Docker, outbound only — no published ports)
  |
  v
Docker Nginx reverse proxy
  |
  +-- bookstore-app.mildfire.dev -> Next.js bookstore container (app:3000)
  |
  +-- api.mildfire.dev -> Supabase Kong/API/Auth/Storage (kong:8000)
  |
  +-- Supabase Studio / Postgres -> private only
```

Production runs both the Next.js app and the self-hosted Supabase stack on the same Docker host.
Nothing on the host listens publicly — Cloudflare reaches nginx through the tunnel. Postgres,
Studio, and all internal Supabase service ports stay private. **Realtime is not deployed** (the
app uses none).

## Hostnames

| Hostname | Purpose | Public? |
| --- | --- | --- |
| `bookstore-app.mildfire.dev` | Next.js storefront/admin app | Yes |
| `api.mildfire.dev` | Supabase API/Auth/Storage/Realtime via Kong | Yes |
| `mildfire.dev` | Reserved for future portfolio/root app | Yes, placeholder for now |
| `www.mildfire.dev` | Redirect or mirror of root app | Yes, placeholder for now |
| Supabase Studio | Admin UI for Supabase | No public DNS; SSH tunnel only |
| Postgres `5432` | Database | No public access |

## Supabase Exposure Model — same-origin `/sb` (single image)

The browser does **not** talk to `api.mildfire.dev` directly. It talks to its **own origin under
`/sb`**; the app's middleware (`src/proxy.ts`) proxies `/sb/*` to Supabase and injects the anon
key at runtime (the browser ships only a placeholder). All client-side Supabase operations —
anon auth bootstrap, session refresh, cart/profile/likes, avatar/story uploads, public + signed
storage URLs — go through `/sb`. Because nothing Supabase-specific is baked into the image, the
exact image CI tested is the one promoted to prod. Design:
[docs/plans/cicd-single-image-and-edge-tests.md](../plans/cicd-single-image-and-edge-tests.md).

The public anon key is not a secret; security still depends on:

- RLS policies;
- storage policies;
- JWT claims;
- service-role key staying server-only;
- Postgres and Studio staying private;
- no direct exposure of internal Supabase service ports.

(`api.mildfire.dev` is still reachable for the auth-email links and any direct API use, but the
storefront browser path is same-origin `/sb`.)

## Initial Data Source

The local Supabase instance is the launch source of truth. Initial production bootstrap must copy:

- database schema;
- public data;
- auth users and identities;
- storage metadata rows;
- actual storage object files.

Before the production dump, local data should be cleaned:

- remove throwaway/test orders;
- keep or create only the intended admin account for production access;
- keep launch catalog/content data;
- keep required storage objects.

After launch, production Supabase becomes the long-lived source of production data. Local Supabase remains development only.

## Git Flow

The repository uses:

- `feature/**` / `feat/**` branches for work in progress;
- **`main`** as the trunk — full CI runs here and builds the tested image;
- `production` as the deploy branch, an **exact mirror of `main`**.

There is no staging server. Full CI (`.github/workflows/ci.yml`) runs on pushes + PRs to `main`:
`audit → lint → unit → integration → build → e2e`. Promote by pushing `main` onto `production`
(`git push origin main:production`), which triggers the deploy workflow
(`.github/workflows/deploy-production.yml`) — promote-only, gated on the SHA's green CI run.

```text
feature branch -> PR -> main (full CI + image build) -> production (promote + deploy)
```

Full detail: [GitHub Actions CI/CD](github-actions-ci-cd.md).

## Container Registry

Next.js app images are published to GitHub Container Registry:

```text
ghcr.io/devmildfire/bookstore-app:<git-sha>
ghcr.io/devmildfire/bookstore-app:production
```

The VPS deploy step pulls the immutable SHA tag and updates the app service through Docker Compose.

## Production Directory

Production files live under:

```text
/opt/chtivo/
  docker-compose.yml
  .env
  nginx/
  supabase/
  STATUS.md
```

Backups live outside the app directory:

```text
/backups/chtivo/
```

## Current VPS Baseline

Completed on the VPS:

- Docker Engine and Docker Compose plugin installed.
- Docker Nginx smoke test running.
- Cloudflare DNS proxied for `mildfire.dev`, `www`, `api`, and `bookstore-app`.
- Cloudflare SSL/TLS mode is Full (strict).
- Cloudflare Origin Certificate installed on the VPS.
- Host Nginx disabled.
- UFW is active with bootstrap access to SSH/HTTP/HTTPS.
- Fail2ban is active.
- SSH password auth is disabled.
- Docker and journald log retention configured.
- `/backups/chtivo` exists.

## Dependency & vulnerability monitoring

GitHub-native + self-hosted, no extra platform. Four signals:

- **Renovate** (self-hosted Action, weekly) — version-update + digest-pin PRs across npm, Docker, and
  GitHub Actions. Low-risk updates (Actions, devDep patch/minor, lockfile) auto-merge on green; prod
  deps / majors / Docker need manual merge. The migration-coupled Supabase images (`postgres`/`gotrue`/
  `storage-api`) get a digest pin only, never a version bump.
- **Dependabot Alerts** — the GitHub Security dashboard for new CVEs (Renovate raises the fix PRs;
  Dependabot security *updates* are off to avoid duplicates).
- **Trivy** (nightly) — scans the deployed `:production` image + repo filesystem, **gating** on
  HIGH/CRITICAL → SARIF in Security ▸ Code scanning; a CRITICAL also pages Telegram. `:latest` + the
  Supabase images are scanned informationally.
- **`npm audit`** — synchronous CI gate (blocks shipping a high/critical build).

**Review ritual:** weekly — triage the Renovate Dependency Dashboard + new Code-scanning findings;
monthly — held majors, Node/base-image moves, `RENOVATE_TOKEN` expiry. Full design + tracker:
[docs/plans/dependency-monitoring.md](../plans/dependency-monitoring.md).

> Note: `main` is **branch-protected** — no direct pushes; every change lands via a PR that passes the
> full `ci.yml`. See [github-actions-ci-cd.md](github-actions-ci-cd.md).

## Related Documents

- [GitHub Actions CI/CD](github-actions-ci-cd.md)
- [Infra sync protocol](infra-sync.md) — how to apply `deploy/`+`monitoring/` config to the VPS safely (drift audit → scoped recreate)
- [Dependency & vulnerability monitoring](../plans/dependency-monitoring.md)
- [Supabase Production Bootstrap](supabase-production-bootstrap.md)
- [Deployment Tracker](TRACKER.md)
