# Supabase Production Bootstrap Plan

This document describes the initial migration from local Supabase to the production VPS.

## Goal

Create a production self-hosted Supabase stack on the VPS using the local Supabase state as the launch source of truth.

The bootstrap must copy:

- database schema;
- public data;
- auth users and identities;
- storage metadata;
- actual storage objects.

After bootstrap, production Supabase is long-lived and local Supabase becomes development-only.

## Production Exposure

Public:

```text
https://api.mildfire.dev/auth/v1/*
https://api.mildfire.dev/rest/v1/*
https://api.mildfire.dev/storage/v1/*
https://api.mildfire.dev/realtime/v1/*
```

Private:

```text
Postgres 5432
Supabase Studio
postgres-meta
analytics/logflare
internal service ports
```

Supabase Studio access should be through SSH tunnel for launch. Example shape:

```bash
ssh -L 54323:127.0.0.1:54323 deploy@<vps-ip>
```

The final tunnel command depends on how Studio is bound in production compose.

## Version Pinning

Production should initially match local Supabase image versions:

| Service | Local image |
| --- | --- |
| Studio | `public.ecr.aws/supabase/studio:2026.04.28-sha-89d08a2` |
| postgres-meta | `public.ecr.aws/supabase/postgres-meta:v0.96.4` |
| Storage API | `public.ecr.aws/supabase/storage-api:v1.54.1` |
| PostgREST | `public.ecr.aws/supabase/postgrest:v14.10` |
| Realtime | _not deployed_ (app uses no Realtime — service removed from prod compose) |
| Mailpit/Inbucket | _not deployed_ (prod email is Resend via the send-email hook) |
| GoTrue/Auth | `public.ecr.aws/supabase/gotrue:v2.188.1` |
| Kong | `kong/kong:3.9.1` (minimal static declarative config, not the Supabase Kong image) |
| Vector | `public.ecr.aws/supabase/vector:0.53.0-alpine` |
| Logflare/Analytics | `public.ecr.aws/supabase/logflare:1.39.1` |
| Postgres | `public.ecr.aws/supabase/postgres:17.6.1.106` |

Do not upgrade Supabase images during the initial migration.

## Local Cleanup Before Dump

Before creating the production dump:

- remove throwaway/test orders;
- keep or create the intended production admin auth user;
- verify admin user has `app_metadata.role = "admin"`;
- verify production catalog/content rows are correct;
- verify all referenced storage files exist;
- run the RLS drift check:

```bash
node scripts/check-rls.mjs
```

Do not run destructive database operations without a fresh backup.

## Database Export

Use a full dump from local Supabase so auth schemas and storage metadata are included.

> **Rehearsal correction (2026-06-15): dump WITH ownership and privileges.** Do
> **NOT** pass `--no-owner --no-privileges` for a self-host *bootstrap* (they're only
> appropriate when restoring over an already-provisioned Supabase DB). Stripping
> ownership breaks the `storage` schema: `supabase_storage_admin` ends up unable to read
> `storage.migrations` (`relation "migrations" does not exist`) and the Storage API never
> starts. The dump must carry owners + grants so the service roles keep their schema
> access. (The general-purpose backup command in `CLAUDE.md` keeps those flags — that path
> restores over the *same* live DB and is fine; this bootstrap path is different.)

Local command shape:

```bash
mkdir -p backups
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  -Fc \
  > "backups/chtivo-local-full-$(date +%Y%m%d-%H%M%S).dump"
```

Also keep a plain SQL inspection dump:

```bash
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  > "backups/chtivo-local-full-$(date +%Y%m%d-%H%M%S).sql"
```

## Storage Export

**Discovered (2026-06-15).** Local storage uses the file backend
(`STORAGE_BACKEND=file`, `FILE_STORAGE_BACKEND_PATH=/mnt`) and the objects live in a
**Docker named volume**, not a bind mount:

- Volume: `supabase_storage_chtivo-next`
- Container mount: `/mnt` in `supabase_storage_chtivo-next`
- Host path (root-owned, under `/var/lib/docker`): `/var/lib/docker/volumes/supabase_storage_chtivo-next/_data`
- On-disk layout (S3-compatible): `/mnt/stub/stub/<bucket>/<object-key>/<version-uuid>`
- Size: ~1.0 GB, 572 files, 16 buckets.

Each object **key is a directory** of version blobs named by UUID. The active blob's UUID
equals `storage.objects.version` in the DB (verified). Objects re-uploaded locally keep old
version blobs on disk — harmless cruft, which is why the file count (572) exceeds the
metadata row count (414).

**Consequences:**

- Archive the volume **verbatim** (the whole `/mnt` tree, preserving `stub/stub/...`) and
  restore it **verbatim**. Do not reshape paths.
- The DB dump (carries `storage.objects` metadata + version UUIDs) and the storage archive
  **must be a consistent pair** — take them back-to-back, after local cleanup, and do not
  upload/delete any storage object in between, or version UUIDs will diverge.
- Production storage-api must use the **same image version and the same config**
  (`STORAGE_BACKEND=file`, `FILE_STORAGE_BACKEND_PATH=/mnt`, `GLOBAL_S3_BUCKET=stub`) so it
  resolves the restored paths.

The `deploy`/dev user can't read the volume directly (root-owned), but can run Docker, so
archive via a throwaway container that mounts the volume read-only:

> **Rehearsal correction (2026-06-15): preserve extended attributes (xattrs).**
> storage-api v1.54.1's file backend stores each object's metadata
> (`content-type`, `cache-control`) as POSIX xattrs on the blob
> (`user.supabase.content-type`, `user.supabase.cache-control`). A plain `tar czf`
> **silently drops xattrs**, so after restore every object GET returns
> **HTTP 500 `ENODATA` / "The extended attribute does not exist."** The archive must be
> created **and** extracted with GNU tar's `--xattrs --xattrs-include='user.*'`
> (busybox/alpine's default `tar` does not do xattrs — install the `tar` + `attr`
> packages, which provide GNU tar + getfattr).

```bash
# Run locally, immediately after the DB dump (consistent pair). Writes into ./backups.
mkdir -p backups
docker run --rm \
  -v supabase_storage_chtivo-next:/from:ro \
  -v "$PWD/backups:/to" \
  alpine sh -c 'apk add -q tar attr gzip && cd /from && \
    tar --xattrs --xattrs-include="user.*" -czf "/to/chtivo-local-storage-'$(date +%Y%m%d-%H%M%S)'-xattrs.tar.gz" .'
```

`cd /from && tar ... .` archives the volume *contents* (the `stub/` tree) so restore
extracts straight into the production volume root.

## Transfer To VPS

Use `scp` or `rsync` from the local machine to `/backups/chtivo` on the VPS:

```bash
scp backups/chtivo-local-full-*.dump deploy@<vps-ip>:/backups/chtivo/
scp backups/chtivo-local-storage-*.tar.gz deploy@<vps-ip>:/backups/chtivo/
```

If `/backups/chtivo` is root-owned and not writable by `deploy`, copy to `/home/deploy` first, then move with `sudo`.

## Production Restore

Restore only into a fresh production Supabase DB volume/container during initial bootstrap.
**This whole sequence was rehearsed locally end-to-end on 2026-06-15** (full stack up,
catalog + public storage + signed-URL all verified through nginx). Follow it exactly.

**Order matters:** bring up `db` (let it first-init: `roles.sql` etc.) → restore DB →
run the post-restore grants → start the rest of the stack. PostgREST caches the schema at
startup, so it must start **after** the restore or it serves `404` on every table.

### 1. Restore the DB — as `supabase_admin`, keeping owners + privileges

```bash
cat /backups/chtivo/chtivo-local-full-YYYYMMDD-HHMMSS.dump | \
  docker compose exec -T db pg_restore -U supabase_admin -d postgres \
    --clean --if-exists
```

- **`-U supabase_admin`, not `postgres`.** `postgres` is not a superuser in Supabase and
  hits `permission denied for schema auth/storage` / `must be owner of table users`.
  `supabase_admin` is the superuser.
- **No `--no-owner` / `--no-privileges`** (see the export note — stripping them breaks the
  Storage API's access to `storage.migrations`).
- A handful of benign errors are expected and can be ignored: `role
  "supabase_realtime_admin" does not exist` (we don't deploy Realtime — see below) and one
  `graphql` schema grant.

### 2. Re-apply the security grants (LAST, after every restore)

`pg_restore` does **not** preserve REVOKEs — the supabase roles get full privileges back via
`ALTER DEFAULT PRIVILEGES` on object creation. Re-apply the app's explicit grants/revokes
(idempotent). **This must run after the *final* restore** — a later re-restore re-strips it.

```bash
docker compose exec -T db psql -U supabase_admin -d postgres \
  -v ON_ERROR_STOP=1 -f - < volumes/db/post-restore-grants.sql
```

Verify locked: `has_table_privilege('anon','public."Titles"','INSERT')` → `false`,
`has_function_privilege('anon','public.admin_set_order_fulfillment(...)','EXECUTE')` →
`false`, while `service_role` keeps `admin_set_order_fulfillment` and `anon` keeps
`apply_promo_code`.

### 3. Restore storage — extract WITH xattrs, before storage-api first starts

Extract into the **production storage volume** via a throwaway container, **before** the
storage-api container first starts (empty volume, no clobber):

```bash
# On the VPS. Replace <PROD_STORAGE_VOLUME> with the prod compose volume (e.g. chtivo_storage-data).
docker run --rm \
  -v <PROD_STORAGE_VOLUME>:/to \
  -v /backups/chtivo:/from:ro \
  alpine sh -c 'apk add -q tar attr gzip && cd /to && \
    tar --xattrs --xattrs-include="user.*" -xzf /from/chtivo-local-storage-YYYYMMDD-HHMMSS-xattrs.tar.gz'
```

- **`--xattrs --xattrs-include='user.*'` is mandatory** (see the export note) or every object
  GET returns 500 `ENODATA`. Use the `…-xattrs.tar.gz` archive, not a plain `tar czf` one.
- Verify a blob kept its metadata:
  `docker run --rm -v <PROD_STORAGE_VOLUME>:/v:ro alpine sh -c 'apk add -q attr; getfattr -d -m - $(find /v -type f -path "*covers*" | head -1)'`
  → should print `user.supabase.content-type` + `user.supabase.cache-control`.
- After extraction the prod volume should mirror local: `/to/stub/stub/<bucket>/...`
  (`du -sh` ≈ 1.0 GB, ~572 files).

### Stack deltas confirmed by the rehearsal

- **Realtime is not deployed** — the app uses no Realtime. The service was removed from the
  compose; the `supabase_realtime_admin` restore errors above are the only trace and are
  harmless.
- **Kong** runs `kong/kong:3.9.1` with a **minimal static declarative config**
  (`volumes/api/kong.yml`: routes + CORS only) mounted read-only — no env templating, no
  custom entrypoint. We use legacy HS256 anon/service keys, so the gateway needs no
  apikey→JWT translation; the services validate JWTs and RLS protects data.
- **Storage healthcheck** must hit `http://127.0.0.1:5000/status`, not `localhost`
  (storage binds IPv4 only; `localhost` → `::1` first → connection refused → false unhealthy).
- **GoTrue send-email hook** URI must be an `https://` (or loopback) URL — GoTrue rejects a
  non-loopback `http://` host (`only localhost, 127.0.0.1, ::1 supported with http`). Use
  `${NEXT_PUBLIC_BASE_URL}/api/auth/hooks/send-email`.
- **nginx** proxies via the Docker resolver + a variable upstream
  (`set $app_upstream app:3000; proxy_pass http://$app_upstream;`) so it starts even if the
  app container is briefly absent and re-resolves the upstream IP across redeploys.

The production DB container name will be finalized with the production compose file.

## Production Environment

Production `.env` must include, at minimum:

- `NEXT_PUBLIC_BASE_URL=https://bookstore-app.mildfire.dev`;
- `NEXT_PUBLIC_SUPABASE_URL=https://api.mildfire.dev`;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- Supabase service-role key for server-only admin paths;
- JWT secret;
- Postgres password;
- SMTP/Resend settings;
- OAuth provider credentials;
- payment provider settings;
- PostHog settings if used.

Secrets must not be committed.

## Validation After Restore

Required smoke tests:

- `https://api.mildfire.dev/auth/v1/health` or equivalent health endpoint;
- public storage asset loads;
- anonymous browser session can be created;
- login with production admin account works;
- `/admin` recognizes admin role;
- catalog pages load images from `api.mildfire.dev`;
- avatar upload works;
- story submission upload works;
- checkout creates a pending order;
- private/signed file access works for an authorized user.

## Backup After Bootstrap

Immediately after successful bootstrap:

- create a fresh production DB backup;
- create a fresh production storage backup;
- copy both offsite;
- record backup filenames in `/opt/chtivo/STATUS.md`.
