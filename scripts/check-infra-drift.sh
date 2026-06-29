#!/usr/bin/env bash
# Pre-sync drift audit: diff every TRACKED deploy/production + monitoring file between the repo
# (origin/main) and the live VPS (/opt/chtivo). Run this BEFORE any infra sync.
#
#   VPS-ahead  (✗ DIFFERS, VPS has edits not in the repo) → STOP: commit them to the repo first,
#              or the sync's `tar -x` will overwrite (= wipe) them. This is what broke grafana.
#   repo-ahead (✗ DIFFERS, repo changed, VPS behind)      → that's what you're about to deploy.
#   missing    (⚠) → a tracked file not present at the mapped VPS path; investigate the path.
#
# Read-only: SSHes and `cat`s files, changes nothing. Usage: scripts/check-infra-drift.sh
set -uo pipefail

VPS="${VPS_ALIAS:-portfolio-vps}"
REF="${INFRA_REF:-origin/main}"
git fetch -q origin main 2>/dev/null || true

drift=0
printf '%-52s %s\n' "FILE (repo path)" "STATUS  [repo=$REF  vps=$VPS:/opt/chtivo]"
printf '%-52s %s\n' "----------------" "------"
while read -r f; do
  case "$f" in
    *.md|*.example|*.bak|*/.gitignore|*/.gitkeep) continue ;;
    deploy/production/*) vpspath="/opt/chtivo/${f#deploy/production/}" ;;
    monitoring/*)        vpspath="/opt/chtivo/monitoring/${f#monitoring/}" ;;
    *) continue ;;
  esac
  repo=$(git show "$REF:$f" 2>/dev/null)
  # -n is REQUIRED: without it ssh reads the loop's stdin (the `git ls-files` feed) and the
  # while-loop dies after one iteration.
  vps=$(ssh -n -o ConnectTimeout=15 "$VPS" "cat '$vpspath' 2>/dev/null" 2>/dev/null)
  if [ -z "$vps" ]; then
    printf '%-52s %s\n' "$f" "⚠ MISSING on VPS ($vpspath)"; drift=1
  elif [ "$repo" = "$vps" ]; then
    printf '%-52s %s\n' "$f" "= same"
  else
    n=$(diff <(printf '%s' "$repo") <(printf '%s' "$vps") | grep -cE '^[<>]')
    printf '%-52s %s\n' "$f" "✗ DIFFERS ($n lines) — inspect direction before syncing"; drift=1
  fi
done < <(git ls-files deploy/production monitoring)

echo
if [ "$drift" -eq 0 ]; then
  echo "✓ No drift — repo and VPS match. Safe to sync (nothing to apply, or already in sync)."
else
  echo "⚠ Drift above. For each ✗/⚠: if the VPS is AHEAD (edited on the box, not in git),"
  echo "  commit it to the repo FIRST. Only sync once the repo is the source of truth."
fi
# Note: .env / alertmanager.yml / telegram_token are gitignored (not tracked) — intentionally
# divergent (secrets) and never touched by the sync, so they're correctly skipped here.
