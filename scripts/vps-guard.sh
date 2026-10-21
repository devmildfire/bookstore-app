#!/usr/bin/env bash
# Read-only canary for infra changes on the shared VPS (docs/plans/infra-upgrade-2026-10.md).
# The box also hosts a VPN stack (compose project `vpn`) that must never be disrupted, so run this
# BEFORE and AFTER every upgrade step and stop (roll back) on any ✗.
#   VPN:      all `vpn` containers running; vpn-web answers on host :443, the 3x-ui panel on :2053
#   headroom: MemAvailable > 2 GiB, / free > 15 GiB, 1-min load < 2 (3 vCPU)
#   our site: https://bookstore-app.mildfire.dev/api/health → 200
# Usage: scripts/vps-guard.sh   (exit 0 = all good)
set -uo pipefail
VPS="${VPS_ALIAS:-portfolio-vps}"

out=$(ssh -n -o ConnectTimeout=15 "$VPS" '
  for c in $(docker ps -a --filter label=com.docker.compose.project=vpn --format "{{.Names}}"); do
    s=$(docker inspect -f "{{.State.Status}}" "$c"); echo "vpn $c $s"
  done
  echo "http443 $(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 https://127.0.0.1/)"
  echo "http2053 $(curl -sk -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:2053/)"
  echo "mem_gib $(awk "/MemAvailable/ {printf \"%.1f\", \$2/1048576}" /proc/meminfo)"
  echo "disk_gib $(df -BG --output=avail / | tail -1 | tr -dc 0-9)"
  echo "load1 $(cut -d" " -f1 /proc/loadavg)"
' 2>&1) || { echo "✗ cannot reach $VPS: $out"; exit 1; }

fail=0
ok() { echo "  ✓ $*"; }
bad() { echo "  ✗ $*"; fail=1; }
n=$(grep -c '^vpn ' <<< "$out")
[ "$n" -ge 3 ] || bad "expected ≥3 vpn containers, found $n"
while read -r _ c s; do [ "$s" = running ] && ok "vpn $c running" || bad "vpn $c is $s"; done < <(grep '^vpn ' <<< "$out")
get() { awk -v k="$1" '$1 == k {print $2}' <<< "$out"; }
[ "$(get http443)" != 000 ] && ok "vpn-web answers on :443 ($(get http443))" || bad "vpn-web not answering on :443"
[ "$(get http2053)" != 000 ] && ok "3x-ui panel answers on :2053 ($(get http2053))" || bad "3x-ui panel not answering on :2053"
awk -v m="$(get mem_gib)" 'BEGIN { exit !(m > 2) }' && ok "MemAvailable $(get mem_gib) GiB" || bad "MemAvailable $(get mem_gib) GiB (< 2)"
[ "$(get disk_gib)" -gt 15 ] && ok "disk free $(get disk_gib) GiB" || bad "disk free $(get disk_gib) GiB (< 15)"
awk -v l="$(get load1)" 'BEGIN { exit !(l < 2) }' && ok "load1 $(get load1)" || bad "load1 $(get load1) (≥ 2)"
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 https://bookstore-app.mildfire.dev/api/health)
[ "$code" = 200 ] && ok "site /api/health 200" || bad "site /api/health $code"

[ "$fail" = 0 ] && echo "GUARD OK" || echo "GUARD FAILED — stop and roll back"
exit "$fail"
