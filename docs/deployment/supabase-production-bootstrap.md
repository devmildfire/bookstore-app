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
| Realtime | `public.ecr.aws/supabase/realtime:v2.86.3` |
| Mailpit/Inbucket | `public.ecr.aws/supabase/mailpit:v1.22.3` |
| GoTrue/Auth | `public.ecr.aws/supabase/gotrue:v2.188.1` |
| Kong | `public.ecr.aws/supabase/kong:2.8.1` |
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

Local command shape:

```bash
mkdir -p backups
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  --no-owner --no-privileges \
  -Fc \
  > "backups/chtivo-local-full-$(date +%Y%m%d-%H%M%S).dump"
```

Also keep a plain SQL inspection dump:

```bash
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  --no-owner --no-privileges \
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

```bash
# Run locally, immediately after the DB dump (consistent pair). Writes into ./backups.
mkdir -p backups
docker run --rm \
  -v supabase_storage_chtivo-next:/from:ro \
  -v "$PWD/backups:/to" \
  alpine tar czf "/to/chtivo-local-storage-$(date +%Y%m%d-%H%M%S).tar.gz" -C /from .
```

`-C /from .` archives the volume *contents* (the `stub/` tree) so restore extracts straight
into the production volume root.

## Transfer To VPS

Use `scp` or `rsync` from the local machine to `/backups/chtivo` on the VPS:

```bash
scp backups/chtivo-local-full-*.dump deploy@<vps-ip>:/backups/chtivo/
scp backups/chtivo-local-storage-*.tar.gz deploy@<vps-ip>:/backups/chtivo/
```

If `/backups/chtivo` is root-owned and not writable by `deploy`, copy to `/home/deploy` first, then move with `sudo`.

## Production Restore

Restore only into a fresh production Supabase DB volume/container during initial bootstrap.

Command shape:

```bash
cat /backups/chtivo/chtivo-local-full-YYYYMMDD-HHMMSS.dump | \
  docker exec -i supabase_db_chtivo-next pg_restore -U postgres -d postgres \
    --clean --if-exists --no-owner --no-privileges
```

The production DB container name will be finalized with the production compose file.

Storage restore — extract into the **production storage volume** via a throwaway container,
**before the production storage-api container first starts** (empty volume, no clobber):

```bash
# On the VPS. Replace <PROD_STORAGE_VOLUME> with the volume name from the prod compose
# (e.g. created as `chtivo_storage` or `<project>_storage_...`). Run as root/sudo so the
# extracted files keep root ownership (matches local, which storage-api reads fine).
docker run --rm \
  -v <PROD_STORAGE_VOLUME>:/to \
  -v /backups/chtivo:/from:ro \
  alpine sh -c 'cd /to && tar xzf /from/chtivo-local-storage-YYYYMMDD-HHMMSS.tar.gz'
```

After extraction the prod volume should mirror local: `/to/stub/stub/<bucket>/...`. Verify
with `docker run --rm -v <PROD_STORAGE_VOLUME>:/v:ro alpine sh -c 'du -sh /v; find /v -type f | wc -l'`
(expect ~1.0 GB / 572 files, matching local at export time).

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
