#!/usr/bin/env bash
# Tier-1 candidate-image test: boot a candidate infra image with its REAL prod
# config and prove it starts + serves. Catches config/startup incompatibility —
# the #1 infra-bump risk (e.g. an nginx directive or kong declarative-config
# change) — BEFORE a merge. This is the "inherent test" these third-party images
# otherwise lack. See docs/plans/infra-image-automation.md §0.3 (Tier 1).
#
# Usage: candidate-boot.sh <service> <image>
#   service ∈ {nginx, kong}   (Tier-1 set — config-only, no DB; more added incrementally)
# Exit: 0 = candidate healthy · 1 = failed · 3 = no Tier-1 test for this service (skip).
set -uo pipefail
SVC="${1:?usage: candidate-boot.sh <service> <image>}"
IMG="${2:?usage: candidate-boot.sh <service> <image>}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NAME="smoke-cand-${SVC}-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# Poll a URL until it returns the expected status (services take a moment to bind).
probe() {
  local url="$1" exp="$2" code=""
  for _ in $(seq 1 20); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$url" 2>/dev/null)
    [ "$code" = "$exp" ] && { echo "  ✓ $url → $code"; return 0; }
    sleep 1
  done
  echo "  ✗ $url → ${code:-timeout} (expected $exp)"
  return 1
}

case "$SVC" in
  nginx)
    echo "[nginx] nginx -t against $IMG (real prod config)"
    docker run --rm -v "$ROOT/deploy/production/nginx/conf.d:/etc/nginx/conf.d:ro" "$IMG" nginx -t || exit 1
    echo "[nginx] boot + probe /healthz"
    docker run -d --name "$NAME" -p 18080:80 \
      -v "$ROOT/deploy/production/nginx/conf.d:/etc/nginx/conf.d:ro" "$IMG" >/dev/null || exit 1
    probe http://localhost:18080/healthz 200 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;
  kong)
    echo "[kong] kong config parse against $IMG (real declarative config)"
    docker run --rm -e KONG_DATABASE=off \
      -v "$ROOT/deploy/production/volumes/api/kong.yml:/kong.yml:ro" "$IMG" kong config parse /kong.yml || exit 1
    echo "[kong] boot DB-less + probe unrouted 404 (kong serving)"
    docker run -d --name "$NAME" -p 18000:8000 \
      -e KONG_DATABASE=off -e KONG_DECLARATIVE_CONFIG=/home/kong/kong.yml \
      -e KONG_DNS_ORDER=LAST,A,CNAME -e KONG_PLUGINS=cors \
      -v "$ROOT/deploy/production/volumes/api/kong.yml:/home/kong/kong.yml:ro" "$IMG" >/dev/null || exit 1
    probe http://localhost:18000/ 404 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;
  *)
    echo "[$SVC] no Tier-1 test defined — skipping"
    exit 3
    ;;
esac

echo "[$SVC] candidate image OK"
