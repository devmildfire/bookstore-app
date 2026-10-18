#!/usr/bin/env bash
# Send one Telegram message — the single sender for every CI alert (renovate.yml,
# renovate-alert.yml, trivy.yml). Runtime/SLO alerts go via Alertmanager on the VPS instead.
# Usage: TG_TOKEN=… TG_CHAT=… scripts/notify-telegram.sh "message"
set -euo pipefail
: "${TG_TOKEN:?TG_TOKEN unset}" "${TG_CHAT:?TG_CHAT unset}"
curl -fsS "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  -d chat_id="${TG_CHAT}" -d disable_web_page_preview=true \
  --data-urlencode "text=${1:?message required}" > /dev/null
