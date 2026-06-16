# Production Deployment Overview

This directory defines the production deployment plan for `bookstore-app` on a single VPS under the `mildfire.dev` Cloudflare zone. (The VPS host IP lives in the `VPS_HOST` GitHub secret / the VPS itself — it is deliberately kept out of these public docs.)

## Target Architecture

```text
Browser
  |
  v
Cloudflare DNS / TLS / WAF
  |
  v
VPS public ports 80/443
  |
  v
Docker Nginx reverse proxy
  |
  +-- bookstore-app.mildfire.dev -> Next.js bookstore container
  |
  +-- api.mildfire.dev -> Supabase Kong/API/Auth/Storage/Realtime
  |
  +-- Supabase Studio -> private only, reached through SSH tunnel
```

Production runs both the Next.js app and the self-hosted Supabase stack on the same Docker host. Only the Docker Nginx reverse proxy publishes public ports. Postgres, Studio, and all internal Supabase service ports must stay private.

## Hostnames

| Hostname | Purpose | Public? |
| --- | --- | --- |
| `bookstore-app.mildfire.dev` | Next.js storefront/admin app | Yes |
| `api.mildfire.dev` | Supabase API/Auth/Storage/Realtime via Kong | Yes |
| `mildfire.dev` | Reserved for future portfolio/root app | Yes, placeholder for now |
| `www.mildfire.dev` | Redirect or mirror of root app | Yes, placeholder for now |
| Supabase Studio | Admin UI for Supabase | No public DNS; SSH tunnel only |
| Postgres `5432` | Database | No public access |

## Supabase Exposure Model

The browser must be able to reach `api.mildfire.dev`. This app uses `createBrowserClient()` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and client-side code performs Supabase operations such as:

- anonymous auth bootstrap on first visit;
- auth session refresh and auth state changes;
- cart/profile/likes client operations;
- avatar/story uploads;
- public storage URL loading;
- signed/private storage operations where the current user is authorized.

This is the standard Supabase browser model. The public anon key is not a secret. Security depends on:

- RLS policies;
- storage policies;
- JWT claims;
- service-role key staying server-only;
- Postgres and Studio staying private;
- no direct exposure of internal Supabase service ports.

Do not try to make `api.mildfire.dev` admin-only without a deliberate application rewrite that moves all browser Supabase calls behind Next.js route handlers/server actions.

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

- feature branches for work in progress;
- **`update`** as the de-facto trunk / integration branch (the planned `master` was never
  created — `update` plays that role and is many hundreds of commits ahead of the stale
  `main`);
- `production` as the deploy branch (branched from `update`).

There is no staging server. `update` is for aggregation and CI validation. `production` is the
branch that deploys to the VPS.

Actual flow:

```text
feature branch -> pull request -> update (trunk, CI) -> production -> deploy
```

CI (`.github/workflows/docker-publish.yml`, job name "CI") runs lint + build on pushes to
`update`/`main`/`staging` and on PRs into `main`/`staging`. A push to `production` triggers the
deploy workflow (`.github/workflows/deploy-production.yml`) — typically `git push origin update:production`.

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

## Related Documents

- [GitHub Actions CI/CD](github-actions-ci-cd.md)
- [Supabase Production Bootstrap](supabase-production-bootstrap.md)
- [Deployment Tracker](TRACKER.md)
