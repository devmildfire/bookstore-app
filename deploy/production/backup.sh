#!/usr/bin/env bash
#
# Daily production backup — runs ON the VPS (deploy user, via cron).
# Dumps the DB and archives the storage volume into ~/chtivo-backups/, with rotation.
# A separate PULL on the workstation (rsync over ssh) copies these off-box; the VPS
# never initiates the transfer (one-way trust: workstation -> VPS only).
#
# Install:  cp deploy/production/backup.sh ~/chtivo-backup.sh && chmod +x ~/chtivo-backup.sh
# Cron:     0 4 * * *  $HOME/chtivo-backup.sh >> $HOME/chtivo-backups/backup.log 2>&1
set -euo pipefail

COMPOSE_DIR=/opt/chtivo
BK="$HOME/chtivo-backups"
STORAGE_VOLUME=chtivo_storage-data
DB_KEEP_DAYS=30
STORAGE_KEEP_DAYS=7

mkdir -p "$BK"
cd "$COMPOSE_DIR"
TS="$(date +%Y%m%d-%H%M%S)"

# --- Database: custom-format dump WITH ownership/privileges (self-host restore needs them) ---
db_tmp="$BK/chtivo-prod-db-$TS.dump.part"
docker compose exec -T db pg_dump -U supabase_admin -d postgres -Fc > "$db_tmp"
mv -f "$db_tmp" "$BK/chtivo-prod-db-$TS.dump"

# --- Storage: archive the volume verbatim, WITH xattrs (or restored objects return 500) ---
# busybox tar can't do xattrs; use GNU tar + attr from a throwaway alpine container.
st_name="chtivo-prod-storage-$TS.tar.gz"
docker run --rm \
  -v "$STORAGE_VOLUME":/from:ro \
  -v "$BK":/to \
  alpine sh -c "apk add -q tar attr gzip && cd /from && \
    tar --xattrs --xattrs-include='user.*' -czf '/to/$st_name.part' . && \
    mv -f '/to/$st_name.part' '/to/$st_name'"

# --- Rotation (local to the VPS; the workstation keeps a longer history) ---
find "$BK" -maxdepth 1 -name 'chtivo-prod-db-*.dump'        -mtime +"$DB_KEEP_DAYS"      -delete
find "$BK" -maxdepth 1 -name 'chtivo-prod-storage-*.tar.gz' -mtime +"$STORAGE_KEEP_DAYS" -delete
# Clean any stale partials from an interrupted run.
find "$BK" -maxdepth 1 -name '*.part' -mtime +1 -delete

echo "$(date -Is) backup ok: chtivo-prod-db-$TS.dump + $st_name ($(du -h "$BK/$st_name" | cut -f1))"
