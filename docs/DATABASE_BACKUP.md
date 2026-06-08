# Database backups & destructive-operation safety

> **DIRECTIVE (all agents, no exceptions):** **Always create a fresh database
> backup before ANY destructive database operation.** Destructive = `supabase db
> reset`, `DROP TABLE/SCHEMA/DATABASE`, `TRUNCATE`, bulk `DELETE`/`UPDATE`,
> destructive migrations, restoring a dump over a live DB, or anything that can
> lose rows. If you are unsure whether an operation is destructive, back up first.
> This rule exists because a database was wiped during dev (admin user + several
> tables lost) on 2026-06-06 — see `docs/plans/edition-demo-button.md` history.

---

## Where backups live

Local pg_dump artifacts go in **`backups/`** at the repo root. This directory is
**gitignored** (dumps can be large and contain data) — the files live only on the
machine that created them. Other agents: look in `backups/` on the local box; do
not expect backups in git.

File naming: `backups/chtivo-db-backup-<YYYYMMDD-HHMMSS>.sql`

---

## Create a backup (local Docker Supabase)

Dump the whole database (all schemas: `public`, `auth`, `storage`, …) so the
backup also captures auth users and storage metadata — the things a
`supabase db reset` does NOT restore:

```bash
mkdir -p backups
docker exec supabase_db_chtivo-next pg_dump -U postgres -d postgres \
  --no-owner --no-privileges \
  > "backups/chtivo-db-backup-$(date +%Y%m%d-%H%M%S).sql"
```

(Using `docker exec` guarantees the `pg_dump` version matches the server.)

Sanity-check the dump after creating it:

```bash
F=$(ls -t backups/*.sql | head -1)
grep -c '^CREATE TABLE' "$F"          # object count
grep -A2 'COPY public."Titles"' "$F"  # confirm catalog data is present
```

---

## Restore a backup

Restoring a full dump is cleanest onto an **empty** database. To restore the
current local instance from a backup:

```bash
# Wipe + recreate the target database, then load the dump.
docker exec -i supabase_db_chtivo-next psql -U postgres -d postgres \
  < backups/chtivo-db-backup-<TS>.sql
```

If objects already exist you'll get conflicts — prefer restoring onto a fresh DB
(e.g. right after `supabase db reset --no-seed`, or into a scratch database).

---

## Notes

- **`supabase db reset` rebuilds only from `supabase/migrations/` + `seed.sql`.**
  It does NOT restore: admin/auth users (recreate with
  `node --env-file=.env scripts/seed-admin.mjs <email> <password>`), storage
  objects (re-run the `scripts/upload-*` + `sync-*-blurs` scripts), or any
  bucket created by a script rather than a migration (e.g. `covers`).
- Keep a backup until the destructive operation is verified successful. Prune old
  dumps manually; they are not tracked or auto-rotated.
</content>
