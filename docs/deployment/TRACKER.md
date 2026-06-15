# Deployment Tracker

Status legend:

- `[x]` done
- `[~]` in progress
- `[ ]` pending

## 1. Decisions

- [x] Use subdomain deployment: `bookstore-app.mildfire.dev`.
- [x] Use `api.mildfire.dev` for public Supabase API/Auth/Storage/Realtime.
- [x] Keep Supabase Studio private, accessed through SSH tunnel for launch.
- [x] Keep Postgres private.
- [x] Use local Supabase as launch source of truth.
- [x] Include auth users in initial production dump.
- [x] Clean local orders/test data before production dump.
- [x] Keep/create only intended production admin user. (Prod auth starts clean with ONLY `chtivoadmin@example.com`; all other/anon users removed locally before the dump.)
- [x] Origin protection model: **Cloudflare Tunnel** (preferred — hides origin IP, no UFW Cloudflare-range upkeep). Compose/Nginx/firewall to be written for the tunnel model.
- [x] Pin production Supabase images to current local versions for initial launch.
- [x] Use GitHub Actions + GHCR for Next.js app deployment.
- [x] Deploy from `production` branch.
- [x] Use `master` as integration/e2e branch.
- [x] Keep feature branches for active work.

## 2. VPS Baseline

- [x] Docker installed.
- [x] Docker Compose plugin installed.
- [x] Docker Nginx smoke test deployed.
- [x] Cloudflare Full (strict) enabled.
- [x] Cloudflare origin certificate installed.
- [x] `mildfire.dev`, `www`, `api`, and `bookstore-app` DNS proxied.
- [x] Host Nginx disabled.
- [x] UFW active with bootstrap 22/80/443.
- [x] Fail2ban active.
- [x] SSH password login disabled.
- [x] Docker log rotation configured.
- [x] journald retention configured.
- [x] `/backups/chtivo` created.

## 3. Local App Work

- [x] Remove production `basePath` and `assetPrefix`.
- [x] Add `api.mildfire.dev` to Next image remote patterns.
- [x] Verify `npm run build` succeeds.
- [x] Add production Docker Compose definitions. (`deploy/production/docker-compose.yml` — full stack, Tunnel model; **rehearsed locally end-to-end 2026-06-15**. Realtime dropped; Kong → minimal static config; storage healthcheck → 127.0.0.1.)
- [x] Add production Nginx routing for `bookstore-app.mildfire.dev`. (`deploy/production/nginx/conf.d/app.conf` — resolver + variable upstream, survives app redeploys.)
- [x] Add production Nginx routing for `api.mildfire.dev`. (Same file; Kong upstream + websocket + upload limits. Verified via `localhost:8088`.)
- [~] Define production env variables. (`deploy/production/.env.example` — fresh-key generation documented; prod `.env` still to be filled with FRESH secrets on the VPS.)
- [ ] Verify app image runs locally or on VPS. (Not yet built — nginx now tolerates its absence; CI/CD will build it.)

## 4. Supabase Production Bootstrap

- [x] Create production Supabase compose file. (In `deploy/production/docker-compose.yml`; **rehearsed locally** — auth/rest/storage/kong all green through nginx.)
- [x] Rehearse the bootstrap restore locally. (2026-06-15 — surfaced + fixed: restore as `supabase_admin` with owners/privileges; `post-restore-grants.sql` last; storage archive needs `tar --xattrs`; PostgREST starts after restore. Both staged bootstrap files re-created: `chtivo-local-full-20260615-owned.dump` + `chtivo-local-storage-20260615-140111-xattrs.tar.gz`.)
- [ ] **Re-stage corrected pair to VPS** (replace the wrong `…-122233.*` files in `~/chtivo-bootstrap/` — owned dump + xattrs archive).
- [x] Pin Supabase images to local versions. (Stateful: postgres 17.6.1.106 / gotrue v2.188.1 / storage v1.54.1 / realtime v2.86.3; stateless on tested official versions.)
- [x] Decide production container names. (Compose project `chtivo`; services db/auth/rest/realtime/storage/meta/studio/kong/app/nginx/cloudflared.)
- [x] Keep Studio private/no public route. (Studio has no nginx route + no host port; SSH tunnel only.)
- [x] Discover local storage volume/path. (Docker volume `supabase_storage_chtivo-next`, mount `/mnt`, layout `/mnt/stub/stub/<bucket>/<key>/<version-uuid>`, ~1.0 GB / 572 files. Archive verbatim via throwaway container; keep DB dump + storage archive a consistent pair.)
- [x] Clean local test orders/data. (Truncated Orders/OrderItems/OGCApps/Cart/CartPromo/GiftCards/UserSubscriptions + AdminAuditLog + Subscribers; deleted 110 non-admin auth users incl. anon. Pre-cleanup safety dump kept.)
- [x] Create/verify production admin auth user locally. (Only `chtivoadmin@example.com` remains — password `<admin-password>`, email identity intact for password login.)
- [x] Verify admin app metadata role. (`app_metadata.role = admin`.)
- [x] Run RLS drift check. (`scripts/check-rls.mjs` → OK.)
- [x] Export local full DB dump. (`backups/chtivo-local-full-20260615-122233.dump` (custom, for pg_restore) + `.sql` inspection. 1 auth user, 414 storage.objects rows, 150 editions.)
- [x] Export local storage object archive. (`backups/chtivo-local-storage-20260615-122233.tar.gz`, ~1.0 GB / 572 file blobs — **consistent pair** with the DB dump above; do not regenerate separately.)
- [x] Transfer DB dump to VPS. (**Corrected pair re-staged 2026-06-15**: `~/chtivo-bootstrap/chtivo-local-full-20260615-owned.dump` — dumped WITH ownership/privileges; sha256 verified. Old `…-122233.dump` removed.)
- [x] Transfer storage archive to VPS. (`~/chtivo-bootstrap/chtivo-local-storage-20260615-140111-xattrs.tar.gz` — created with `tar --xattrs`; sha256 verified. Old `…-122233.tar.gz` removed.)
- [x] Stage prod bundle + `.env` on VPS. (`git archive` → `/opt/chtivo`; `.env` (600) with FRESH secrets + signed anon/service JWTs. `RESEND_*`/`CLOUDFLARE_TUNNEL_TOKEN` still `__FILL__`. `deploy` added to `docker` group.)
- [x] Start production Supabase stack on VPS. (db/auth/rest/storage/meta/kong/studio up + healthy. `app`+`cloudflared` deferred — need GHCR image + tunnel token. studio reports unhealthy: non-blocking, private/SSH-only.)
- [x] Restore DB dump into production DB. (As `supabase_admin`, owners/privileges kept; 15 benign errors. Verified: 69 Titles, 150 Editions, 1 admin user `role=admin`, 414 storage.objects, 59 storage.migrations. post-restore-grants re-applied + verified locked.)
- [x] Restore storage objects. (Extracted with `--xattrs` into `chtivo_storage-data`; 1.0 GB / 572 files, `user.supabase.*` xattrs verified.)
- [x] Verify Supabase API/Auth/Storage via kong on VPS. (auth health 200, REST 69 titles, public cover 200, anon→private 400 (RLS), service_role signed fetch 200 PDF 11.7 MB. Full `api.mildfire.dev` path pending the tunnel.)
- [ ] Verify Studio through SSH tunnel.
- [x] Create first production DB backup. (`~/chtivo-backups/chtivo-prod-db-20260615-101234.dump`, 1.44 MB, custom format w/ ownership; TOC validated 1155 entries.)
- [x] Create first production storage backup. (The bootstrap archive `…-140111-xattrs.tar.gz` IS the first storage backup — storage unchanged since restore, no writes yet.)
- [ ] Copy backups offsite + move to `/backups/chtivo` (root-owned; needs sudo).

## 5. GitHub Actions / CI/CD

- [x] Integration/trunk branch. (`update` is the de-facto trunk — 1864 commits ahead of the stale `main`. No separate `master` created; `production` branches from `update`.)
- [x] Create `production` deploy branch. (Created from `update` HEAD 2026-06-15; push to it triggers the deploy workflow.)
- [x] Add CI workflow for PRs/pushes. (Existing `docker-publish.yml` runs lint + build on `update`/`main`/`staging` + PRs.)
- [x] Add production image workflow for `production`. (`.github/workflows/deploy-production.yml`: push to `production` or manual dispatch.)
- [x] Publish app images to GHCR. (`ghcr.io/devmildfire/bookstore-app:production` + `:<sha>`, public — VPS pulls anonymously.)
- [x] Add dedicated GitHub Actions deploy SSH key. (ed25519 `github-actions-deploy@chtivo`, authorized on VPS `deploy`; private key in `VPS_SSH_KEY` secret only.)
- [x] Add GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PORT` (+ `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret + `NEXT_PUBLIC_SUPABASE_URL` variable).
- [x] Decide image tag injection strategy. (`:production` rolling tag the compose pulls + immutable `:<git-sha>` for rollback.)
- [x] Add VPS deploy workflow. (SSH → `cd /opt/chtivo && docker compose pull app && up -d app && image prune`.)
- [~] Add post-deploy smoke checks. (Workflow prints `docker compose ps app`. A real HTTP check is deferred — SSR 500s until the tunnel (#2) makes `api.mildfire.dev` reachable.)
- [x] Document rollback command. (See below.)

**First production deploy succeeded 2026-06-15** (build+push 7m17s, SSH roll 21s). App container runs the GHCR image; Next.js Ready. Homepage SSR currently returns 500 → Cloudflare **522** because the server calls `https://api.mildfire.dev` and the **tunnel isn't up yet** (#2). Expected; resolves once the tunnel is live. (Open optimization for #2: point the *server-side* Supabase client at internal `http://kong:8000` to avoid a public hairpin on every SSR call; the browser keeps the public URL.)

**Rollback:** images are tagged with the immutable git sha. To roll back, on the VPS edit `/opt/chtivo/.env` `APP_IMAGE=ghcr.io/devmildfire/bookstore-app:<previous-sha>` then `docker compose up -d app` — or re-run the deploy workflow from the known-good commit.

## 6. Security Hardening After App Works

- [x] Confirm no public service ports besides SSH/HTTP/HTTPS. (2026-06-15: no chtivo container publishes to the host — all ports are docker-network-only.)
- [x] Confirm Postgres is not public. (db `5432/tcp` exposed on the docker network only, no host mapping.)
- [x] Confirm Studio is not public. (No nginx route, no host port; SSH tunnel only.)
- [x] Configure Nginx real visitor IP. (nginx `app.conf` reads `CF-Connecting-IP`, trusting only the private docker net — cloudflared is the sole client.)
- [x] Tighten UFW 80/443 — replaced with Tunnel. (2026-06-15: deleted the `80/tcp` + `443/tcp` allow rules, v4+v6; UFW now allows OpenSSH only. Cloudflare Tunnel is the sole ingress, no inbound web ports. Site stays live; SSH intact.)
- [ ] Add Cloudflare WAF verified-bot skip rule.
- [ ] Add Cloudflare WAF challenge rules gradually.
- [ ] Keep Bot Fight Mode off unless tested.
- [ ] Add monitoring alerts.
- [ ] Add backup failure alerting.

## 7. Launch Gate

- [x] `https://bookstore-app.mildfire.dev` loads app. (2026-06-15: 200, full SSR HTML ~2.38 MB, via Cloudflare Tunnel → nginx → app.)
- [x] `https://api.mildfire.dev` serves Supabase API/Auth/Storage through Nginx. (auth health 200, REST `/Titles` 206/69, public cover 200 — all via the tunnel.)
- [ ] Browser anonymous sign-in works.
- [ ] Admin login works.
- [ ] Admin role works.
- [x] Public storage media loads. (`/storage/v1/object/public/covers/...` → 200 image/jpeg via api.mildfire.dev.)
- [ ] Private/signed storage access works.
- [ ] Avatar upload works.
- [ ] Story submission upload works.
- [ ] Checkout creates pending order.
- [ ] Payment callback route tested.
- [ ] Order confirmation email tested or explicitly deferred.
- [ ] Production DB backup tested.
- [ ] Production storage backup tested.
- [ ] Rollback path documented.
