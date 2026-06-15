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
- [ ] Add production Docker Compose definitions.
- [ ] Add production Nginx routing for `bookstore-app.mildfire.dev`.
- [ ] Add production Nginx routing for `api.mildfire.dev`.
- [ ] Define production env variables.
- [ ] Verify app image runs locally or on VPS.

## 4. Supabase Production Bootstrap

- [ ] Create production Supabase compose file.
- [ ] Pin Supabase images to local versions.
- [ ] Decide production container names.
- [ ] Keep Studio private/no public route.
- [x] Discover local storage volume/path. (Docker volume `supabase_storage_chtivo-next`, mount `/mnt`, layout `/mnt/stub/stub/<bucket>/<key>/<version-uuid>`, ~1.0 GB / 572 files. Archive verbatim via throwaway container; keep DB dump + storage archive a consistent pair.)
- [x] Clean local test orders/data. (Truncated Orders/OrderItems/OGCApps/Cart/CartPromo/GiftCards/UserSubscriptions + AdminAuditLog + Subscribers; deleted 110 non-admin auth users incl. anon. Pre-cleanup safety dump kept.)
- [x] Create/verify production admin auth user locally. (Only `chtivoadmin@example.com` remains — password `<admin-password>`, email identity intact for password login.)
- [x] Verify admin app metadata role. (`app_metadata.role = admin`.)
- [x] Run RLS drift check. (`scripts/check-rls.mjs` → OK.)
- [x] Export local full DB dump. (`backups/chtivo-local-full-20260615-122233.dump` (custom, for pg_restore) + `.sql` inspection. 1 auth user, 414 storage.objects rows, 150 editions.)
- [x] Export local storage object archive. (`backups/chtivo-local-storage-20260615-122233.tar.gz`, ~1.0 GB / 572 file blobs — **consistent pair** with the DB dump above; do not regenerate separately.)
- [ ] Transfer DB dump to VPS.
- [ ] Transfer storage archive to VPS.
- [ ] Start production Supabase stack on VPS.
- [ ] Restore DB dump into production DB.
- [ ] Restore storage objects.
- [ ] Verify Supabase API/Auth/Storage/Realtime via `api.mildfire.dev`.
- [ ] Verify Studio through SSH tunnel.
- [ ] Create first production DB backup.
- [ ] Create first production storage backup.
- [ ] Copy backups offsite.

## 5. GitHub Actions / CI/CD

- [ ] Create `master` integration branch if needed.
- [ ] Create `production` deploy branch.
- [ ] Add CI workflow for PRs/pushes to `master`.
- [ ] Add production image workflow for `production`.
- [ ] Publish app images to GHCR.
- [ ] Add dedicated GitHub Actions deploy SSH key.
- [ ] Add GitHub secrets:
  - [ ] `VPS_HOST`
  - [ ] `VPS_USER`
  - [ ] `VPS_SSH_KEY`
  - [ ] `VPS_SSH_PORT`
- [ ] Decide image tag injection strategy.
- [ ] Add VPS deploy workflow.
- [ ] Add post-deploy smoke checks.
- [ ] Document rollback command.

## 6. Security Hardening After App Works

- [ ] Confirm no public service ports besides SSH/HTTP/HTTPS.
- [ ] Confirm Postgres is not public.
- [ ] Confirm Studio is not public.
- [ ] Configure Nginx real visitor IP from Cloudflare ranges.
- [ ] Tighten UFW 80/443 to Cloudflare ranges or replace with Tunnel/Auth Origin Pulls.
- [ ] Add Cloudflare WAF verified-bot skip rule.
- [ ] Add Cloudflare WAF challenge rules gradually.
- [ ] Keep Bot Fight Mode off unless tested.
- [ ] Add monitoring alerts.
- [ ] Add backup failure alerting.

## 7. Launch Gate

- [ ] `https://bookstore-app.mildfire.dev` loads app.
- [ ] `https://api.mildfire.dev` serves Supabase API/Auth/Storage through Nginx.
- [ ] Browser anonymous sign-in works.
- [ ] Admin login works.
- [ ] Admin role works.
- [ ] Public storage media loads.
- [ ] Private/signed storage access works.
- [ ] Avatar upload works.
- [ ] Story submission upload works.
- [ ] Checkout creates pending order.
- [ ] Payment callback route tested.
- [ ] Order confirmation email tested or explicitly deferred.
- [ ] Production DB backup tested.
- [ ] Production storage backup tested.
- [ ] Rollback path documented.
