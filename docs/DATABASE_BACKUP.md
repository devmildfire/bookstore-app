# Database backups & destructive-operation safety

> **PRIME DIRECTIVE — NEVER WIPE STORAGE (absolute, no exceptions, no approval
> can override it):** No database operation may EVER wipe, empty, or recreate the
> storage buckets/objects. Storage and the DB are decoupled on purpose. This rules
> out **`supabase db reset`** (it drops and rebuilds storage) and anything else that
> clears `storage.objects`/buckets as a side effect. If a from-scratch DB rebuild is
> ever needed, do it in a way that leaves storage untouched (scratch database, or
> restore schema+data into the existing DB) — never the kind of reset that takes
> storage with it. Storage has **no reliable restore source**; once wiped it is gone.
>
> **DIRECTIVE (all agents, no exceptions):**
> 1. **NEVER run a destructive database/storage operation autonomously — STOP and
>    get explicit user approval first.**
> 2. **Always take a fresh backup before running it.**
>
> Destructive = `supabase db reset`, `DROP TABLE/SCHEMA/DATABASE`, `TRUNCATE`,
> bulk `DELETE`/`UPDATE`, destructive migrations, `pg_restore`/restoring a dump
> over a live DB, **and any storage deletion** (bucket/object `remove`,
> `emptyBucket`, `deleteBucket`, `delete from storage.*`) — or anything that can
> lose rows or files. If unsure, treat it as destructive: ask, then back up.
>
> This rule exists because an agent wiped the local DB **and storage** during dev
> (admin user + tables + every storage bucket lost) on 2026-06-06.
>
> **Enforcement:** a local Claude Code PreToolUse hook
> (`.claude/hooks/guard-destructive-db.sh`, registered in `.claude/settings.json`)
> intercepts destructive DB/storage Bash commands and forces an approval prompt.
> It is machine-local (the `.claude/` dir is gitignored) — set it up on each dev
> box; it is a safety net, not a substitute for asking.

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

## Infra config + secrets backup

The DB dump + storage tarball cover the *data*. The prod **`backup.sh`** also snapshots the
**infra** in `/opt/chtivo` — the gap that let the grafana 502 happen (a VPS-only nginx vhost was in
no backup) and, more importantly, the gap that left the **secrets** unprotected:

- **`chtivo-prod-config-*.tar.gz`** — plaintext: `docker-compose.yml`, `nginx/`, `volumes/*.sql`,
  `kong.yml`, `monitoring/` config. (Mostly also in git; its unique value is capturing any VPS-only
  drift and enabling a `/opt/chtivo` restore without git.)
- **`chtivo-prod-secrets-*.tar.gz.gpg`** — **GPG-encrypted**: `.env` (prod Supabase keys + **JWT
  secret**), `monitoring/alertmanager/alertmanager.yml`, `telegram_token`. These are **gitignored
  (VPS-only)** — so this is the *only* thing protecting them. Lose the VPS without this and the JWT
  secret is gone (a from-scratch re-key, not a restore).

Data volumes (`db-data`, `storage-data`) are **not** in the config tarball — they're the DB dump +
storage tarball's job.

### Why GPG, and where the keys live (the important part)

Encryption is **asymmetric** — the two halves live in different places:

| Key | Where | Used for |
|---|---|---|
| **Public** | imported into the VPS `deploy` user's gpg keyring; id in `BACKUP_GPG_RECIPIENT` | **encrypting** (backup) — not sensitive |
| **Private** | **your password manager** (+ an offline copy) — *never* on the VPS or any disk | **decrypting** (restore only) |

This is what makes the encryption meaningful, not theatre:
- **Backups need no secret key anywhere** — the VPS seals the secrets with the public key alone.
- **Local machine compromised** → the attacker has your SSH key → the VPS → the *live* `.env`. True.
  But they do **not** have the gpg private key (it's in your password manager, not on disk) → they
  **cannot decrypt the archived secret backups** (rotated/historical secrets, and any offsite copies).
  So this protects *more* than the SSH key already exposes — it is not redundant.
- ⚠ If you instead keep the private key **on the same disk** as the SSH key, encryption only protects
  against lost/leaked *backup media*, not a local compromise. **Off-disk (password manager) is the
  point.**

### One-time setup
```bash
# 1. Generate a keypair (anywhere private — e.g. your laptop):
gpg --quick-generate-key "chtivo-backup <backup@mildfire.dev>" default default never
gpg --armor --export        chtivo-backup > backup-recipient.pub      # PUBLIC  → goes to the VPS
gpg --armor --export-secret-keys chtivo-backup > backup-private.asc    # PRIVATE → password manager, then DELETE this file

# 2. On the VPS (deploy user): import the PUBLIC key + point the backup at it:
#    scp backup-recipient.pub portfolio-vps:~ ; ssh portfolio-vps 'gpg --import backup-recipient.pub'
#    Add to the backup service env (or ~/chtivo-backup.sh):  BACKUP_GPG_RECIPIENT=backup@mildfire.dev

# 3. Store backup-private.asc in your password manager (+ a printed/offline copy). Shred the file.
```
Until `BACKUP_GPG_RECIPIENT` is set, `backup.sh` logs a warning and **skips only the secrets** step
(DB / storage / config still run).

### Restore
Config + secrets restore (unpack config; decrypt secrets with the password-manager key) is in
[docs/deployment/infra-sync.md → Restore from backup](deployment/infra-sync.md#restore-from-backup).
</content>
