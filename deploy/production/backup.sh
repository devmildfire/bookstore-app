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
CONFIG_KEEP_DAYS=30
# GPG recipient (key id / email) for the ENCRYPTED secrets backup. This is the PUBLIC key only —
# import it once into the deploy user's keyring: `gpg --import backup-recipient.pub`. The matching
# PRIVATE key lives in your password manager, NEVER on the VPS (so a VPS/local compromise can't
# decrypt archived secrets). Unset → the secrets backup is skipped (DB/storage/config still run).
BACKUP_GPG_RECIPIENT="${BACKUP_GPG_RECIPIENT:-}"

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

# --- Infra config (plaintext: compose, nginx, kong, init SQL, monitoring config — NO secrets) ---
# Lets you restore /opt/chtivo (and spot drift) without needing git; data volumes are NOT here
# (they're named volumes under /var/lib/docker, covered by the DB dump + storage tarball above).
cfg_name="chtivo-prod-config-$TS.tar.gz"
tar -czf "$BK/$cfg_name.part" -C "$COMPOSE_DIR" \
  --exclude='monitoring/alertmanager/alertmanager.yml' \
  --exclude='monitoring/alertmanager/telegram_token' \
  docker-compose.yml nginx volumes monitoring
mv -f "$BK/$cfg_name.part" "$BK/$cfg_name"

# --- Secrets (ENCRYPTED): .env + alertmanager secrets, sealed to the backup GPG PUBLIC key.
#     These are gitignored (VPS-only) → this is the ONLY thing protecting them. Decryption needs
#     the PRIVATE key (password manager); it never touches the VPS. ---
sec_name=""
if [ -n "$BACKUP_GPG_RECIPIENT" ] && command -v gpg >/dev/null 2>&1; then
  sec_files=()
  for f in .env monitoring/alertmanager/alertmanager.yml monitoring/alertmanager/telegram_token; do
    [ -f "$COMPOSE_DIR/$f" ] && sec_files+=("$f")
  done
  if [ "${#sec_files[@]}" -gt 0 ]; then
    sec_name="chtivo-prod-secrets-$TS.tar.gz.gpg"
    tar -czf - -C "$COMPOSE_DIR" "${sec_files[@]}" \
      | gpg --batch --yes --trust-model always --encrypt --recipient "$BACKUP_GPG_RECIPIENT" \
            -o "$BK/$sec_name.part"
    mv -f "$BK/$sec_name.part" "$BK/$sec_name"
  fi
else
  echo "$(date -Is) WARN: BACKUP_GPG_RECIPIENT unset or gpg missing — skipping encrypted secrets backup"
fi

# --- Rotation (local to the VPS; the workstation keeps a longer history) ---
find "$BK" -maxdepth 1 -name 'chtivo-prod-db-*.dump'           -mtime +"$DB_KEEP_DAYS"      -delete
find "$BK" -maxdepth 1 -name 'chtivo-prod-storage-*.tar.gz'    -mtime +"$STORAGE_KEEP_DAYS" -delete
find "$BK" -maxdepth 1 -name 'chtivo-prod-config-*.tar.gz'     -mtime +"$CONFIG_KEEP_DAYS"  -delete
find "$BK" -maxdepth 1 -name 'chtivo-prod-secrets-*.tar.gz.gpg' -mtime +"$CONFIG_KEEP_DAYS"  -delete
# Clean any stale partials from an interrupted run.
find "$BK" -maxdepth 1 -name '*.part' -mtime +1 -delete

echo "$(date -Is) backup ok: db + storage ($(du -h "$BK/$st_name" | cut -f1)) + config${sec_name:+ + secrets(enc)}"
