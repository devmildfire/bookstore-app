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
- [x] Use an integration/e2e branch. (**`main`** is the trunk — full CI runs there; `production` is an exact mirror for deploy. See §5.)
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
- [x] Verify app image runs locally or on VPS. (Done — first production deploy succeeded 2026-06-15; the GHCR image runs as the `app` container and Next.js reaches Ready. See §5.)

## 4. Supabase Production Bootstrap

- [x] Create production Supabase compose file. (In `deploy/production/docker-compose.yml`; **rehearsed locally** — auth/rest/storage/kong all green through nginx.)
- [x] Rehearse the bootstrap restore locally. (2026-06-15 — surfaced + fixed: restore as `supabase_admin` with owners/privileges; `post-restore-grants.sql` last; storage archive needs `tar --xattrs`; PostgREST starts after restore. Both staged bootstrap files re-created: `chtivo-local-full-20260615-owned.dump` + `chtivo-local-storage-20260615-140111-xattrs.tar.gz`.)
- [x] **Re-stage corrected pair to VPS** (replaced the wrong `…-122233.*` files in `~/chtivo-bootstrap/` with the owned dump + xattrs archive — sha256 verified; see the "Transfer …" rows below).
- [x] Pin Supabase images to local versions. (Stateful: postgres 17.6.1.106 / gotrue v2.188.1 / storage v1.54.1 / realtime v2.86.3; stateless on tested official versions.)
- [x] Decide production container names. (Compose project `chtivo`; services db/auth/rest/realtime/storage/meta/studio/kong/app/nginx/cloudflared.)
- [x] Keep Studio private/no public route. (Studio has no nginx route + no host port; SSH tunnel only.)
- [x] Discover local storage volume/path. (Docker volume `supabase_storage_chtivo-next`, mount `/mnt`, layout `/mnt/stub/stub/<bucket>/<key>/<version-uuid>`, ~1.0 GB / 572 files. Archive verbatim via throwaway container; keep DB dump + storage archive a consistent pair.)
- [x] Clean local test orders/data. (Truncated Orders/OrderItems/OGCApps/Cart/CartPromo/GiftCards/UserSubscriptions + AdminAuditLog + Subscribers; deleted 110 non-admin auth users incl. anon. Pre-cleanup safety dump kept.)
- [x] Create/verify production admin auth user locally. (Only `chtivoadmin@example.com` remains — password kept out of the repo (in the VPS `.env`/secret store), email identity intact for password login.)
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
- [x] Copy backups offsite (automated, 2026-06-16). Two-tier pull-only scheme: a VPS systemd
  `--user` timer (`chtivo-backup.timer`, daily 04:00 UTC, linger on) runs `~/chtivo-backup.sh`
  → DB dump + `tar --xattrs` storage archive into `~deploy/chtivo-backups/` (keep 30d/7d); the
  workstation pulls them daily (systemd `--user` timer + `Persistent`, `ssh`+`scp`, `flock`) into
  `~/backups/chtivo-prod/` (keep 90d/30d). Repo: `deploy/production/backup.sh` +
  `deploy/production/systemd/`; full scheme in `deploy/production/README.md` → "Backups". (Did
  **not** use `/backups/chtivo` — it's root-owned and `deploy` has no sudo; `~deploy/chtivo-backups`
  is the on-VPS location, the workstation is the offsite copy.)

## 5. GitHub Actions / CI/CD

- [x] Integration/trunk branch. (`main` is the trunk — full CI runs there and builds the tested image. The old `update` branch was retired; `production` is now an exact mirror of `main`.)
- [x] Create `production` deploy branch. (Mirrors `main`; promote with `git push origin main:production`, which triggers the deploy workflow.)
- [x] Add CI workflow for PRs/pushes. (`.github/workflows/ci.yml` runs `audit → lint → unit → integration → build → e2e` on pushes + PRs to `main`; feature branches get `audit.yml` + `test-e2e.yml`.)
- [x] Add production image workflow for `production`. (`.github/workflows/deploy-production.yml`: push to `production` or manual dispatch.)
- [x] Publish app images to GHCR. (`ghcr.io/devmildfire/bookstore-app:production` + `:<sha>`, public — VPS pulls anonymously.)
- [x] Add dedicated GitHub Actions deploy SSH key. (ed25519 `github-actions-deploy@chtivo`, authorized on VPS `deploy`; private key in `VPS_SSH_KEY` secret only.)
- [x] Add GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PORT` (+ `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret + `NEXT_PUBLIC_SUPABASE_URL` variable).
- [x] Decide image tag injection strategy. (`:production` rolling tag the compose pulls + immutable `:<git-sha>` for rollback.)
- [x] Add VPS deploy workflow. (SSH → `cd /opt/chtivo && docker compose pull app && up -d app && image prune`.)
- [~] Add post-deploy smoke checks. (Workflow prints `docker compose ps app`. A real HTTP check is deferred — SSR 500s until the tunnel (#2) makes `api.mildfire.dev` reachable.)
- [x] Document rollback command. (See below.)

**First production deploy succeeded 2026-06-15** (build+push 7m17s, SSH roll 21s). App container runs the GHCR image; Next.js Ready.

**SSR hairpin fixed 2026-06-15** — server-side reads/auth now use `SUPABASE_INTERNAL_URL=http://kong:8000` (compose default) instead of the public host; `createAdminClient` stays public for browser-facing signed URLs. Homepage SSR **7.4 s → ~1.2 s** (book page 0.75 s), logs clean.

**Deploy model caveat:** the workflow only rolls the app **image** (`compose pull app && up -d app`); it does NOT sync `/opt/chtivo` infra files. Changes to `docker-compose.yml`/`.env`/`nginx`/`volumes` must be synced by hand (`git archive HEAD:deploy/production | ssh … tar -x -C /opt/chtivo` → `docker compose up -d <svc>`). See `deploy/production/README.md` → "Deploy model".

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
- [x] Add monitoring alerts.
- [ ] Add backup failure alerting.

## 7. Launch Gate

- [x] `https://bookstore-app.mildfire.dev` loads app. (2026-06-15: 200, full SSR HTML ~2.38 MB, via Cloudflare Tunnel → nginx → app.)
- [x] `https://api.mildfire.dev` serves Supabase API/Auth/Storage through Nginx. (auth health 200, REST `/Titles` 206/69, public cover 200 — all via the tunnel.)
- [x] Browser anonymous sign-in works. (2026-06-15: `POST /auth/v1/signup` → 200, anon JWT `is_anonymous:true`, verified in a real browser session.)
- [x] Client-side data loads in the browser. (Cart, Likes, CartPromo, GiftCards, `quote_cart` RPC, box-set books — all 200. **Required a kong CORS fix**: the minimal allow-list rejected the supabase-js preflight headers `Accept-Profile` / `Content-Profile` / `X-Retry-Count`, which blocked every browser query and hung the UI on "Загрузка…". curl smoke tests missed it — they skip the CORS preflight. **Lesson: always browser-test, not just curl.**)
- [ ] Admin login works. (UI login flow not yet exercised end-to-end. The admin account + role are in place — see next item.)
- [x] Admin role works. (2026-06-16: prod DB confirms `chtivoadmin@example.com` has `raw_app_meta_data.role = admin`, email identity intact for password login.)
- [x] Public storage media loads. (`/storage/v1/object/public/covers/...` → 200 image/png via api.mildfire.dev.)
- [x] Private/signed storage access works. (2026-06-16: anon GET on `digital-files/ebook/mrd-1.pdf` → 400 (RLS); `service_role` signs a URL → fetch 200 `application/pdf` 11.7 MB, all via api.mildfire.dev.)
- [ ] Avatar upload works. (Authenticated write flow — not yet exercised against prod.)
- [ ] Story submission upload works. (Authenticated write flow — not yet exercised against prod.)
- [ ] Checkout creates pending order. (Write flow — not exercised against prod to avoid test rows. `PAYMENT_PROVIDER=mock` is the **intended** prod config for this portfolio — see CONCERNS P2; the mock gateway is interactive end-to-end.)
- [ ] Payment callback route tested. (Mock gateway by design; Robokassa intentionally not flipped on — CONCERNS P2.)
- [ ] Order confirmation email tested or explicitly deferred. (Resend config is present in prod `.env`; an actual prod order email has not been sent.)
- [x] Production DB backup tested. (2026-06-16: 3 prod dumps present in `~/chtivo-backups/` — latest `…-164137.dump`; the first `…-101234.dump` was TOC-validated, 1155 entries. Restore-into-fresh-DB not re-run on prod.)
- [ ] Production storage backup tested. (The bootstrap pair `…-140111-xattrs.tar.gz` (~1.0 GB) is staged in `~/chtivo-bootstrap/` and the restore was rehearsed locally; no separate prod-storage backup taken since — storage unchanged.)
- [x] Rollback path documented. (See §5 "Rollback" + `docs/deployment/github-actions-ci-cd.md` → "Rollback Model".)

> **Live verification 2026-06-16** (via `ssh portfolio-vps`, deploy user, read-only): all 10
> containers up (studio unhealthy = documented non-blocker); `bookstore-app.mildfire.dev` →
> 200 (2.4 MB SSR); `api.mildfire.dev/auth/v1/health` → 200 (GoTrue v2.188.1); public + signed
> storage confirmed; admin role confirmed in DB. Remaining open items are authenticated
> write-flows / UI actions deliberately not run against prod. Payments intentionally run on the
> mock gateway (portfolio site — see CONCERNS P2), not an outstanding cutover.
