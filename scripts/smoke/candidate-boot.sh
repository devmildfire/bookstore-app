#!/usr/bin/env bash
# Tier-1 candidate-image test: boot a candidate infra image with its REAL prod
# config and prove it starts + serves. Catches config/startup incompatibility —
# the #1 infra-bump risk (e.g. an nginx directive or kong declarative-config
# change) — BEFORE a merge. This is the "inherent test" these third-party images
# otherwise lack. See docs/plans/infra-image-automation.md §0.3 (Tier 1).
#
# Usage: candidate-boot.sh <service> <image>   (service = compose service name)
#   Tier-1 (config-only, no DB): nginx, kong, grafana, prometheus, node-exporter,
#                                pushgateway, alertmanager
#   Tier-2 (throwaway Postgres):  rest (postgrest), meta (postgres-meta), postgres-exporter
# Exit: 0 = candidate healthy · 1 = failed · 3 = no candidate test for this service (skip).
set -uo pipefail
SVC="${1:?usage: candidate-boot.sh <service> <image>}"
IMG="${2:?usage: candidate-boot.sh <service> <image>}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NAME="smoke-cand-${SVC}-$$"
PG=""   # Tier-2: throwaway postgres container name (set below when needed)
NET=""  # Tier-2: throwaway docker network name
cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  [ -n "$PG" ] && docker rm -f "$PG" >/dev/null 2>&1 || true
  [ -n "$NET" ] && docker network rm "$NET" >/dev/null 2>&1 || true
}
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
  grafana | prometheus | node-exporter | pushgateway | alertmanager)
    # Monitoring images: boot standalone (default config baked in, no DB) and probe
    # the service's own health endpoint. Catches a bad/incompatible image build.
    case "$SVC" in
      grafana)       CPORT=3000; HP=/api/health ;;
      prometheus)    CPORT=9090; HP=/-/healthy ;;
      node-exporter) CPORT=9100; HP=/metrics ;;
      pushgateway)   CPORT=9091; HP=/-/ready ;;
      alertmanager)  CPORT=9093; HP=/-/healthy ;;
    esac
    echo "[$SVC] boot $IMG + probe $HP (standalone)"
    docker run -d --name "$NAME" -p "127.0.0.1::$CPORT" "$IMG" >/dev/null || exit 1
    HOSTPORT=$(docker port "$NAME" "$CPORT/tcp" | head -1 | sed 's/.*://')
    [ -z "$HOSTPORT" ] && { echo "  ✗ no published port for $CPORT"; docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    probe "http://127.0.0.1:$HOSTPORT$HP" 200 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;
  rest | meta | postgres-exporter)
    # Tier-2: DB-coupled (compose service names: rest=postgrest, meta=postgres-meta).
    # Boot a throwaway Postgres + the candidate on a shared network, then probe the
    # candidate's health. Catches an image that can't connect/serve.
    NET="smoke-net-$$"; PG="smoke-pg-$$"
    docker network create "$NET" >/dev/null 2>&1 || exit 1
    echo "[$SVC] boot throwaway postgres"
    docker run -d --name "$PG" --network "$NET" -e POSTGRES_PASSWORD=pw postgres:16-alpine >/dev/null || exit 1
    for _ in $(seq 1 30); do docker exec "$PG" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
    echo "[$SVC] boot $IMG against it + probe"
    case "$SVC" in
      postgres-exporter)
        docker run -d --name "$NAME" --network "$NET" -p '127.0.0.1::9187' \
          -e DATA_SOURCE_NAME="postgresql://postgres:pw@$PG:5432/postgres?sslmode=disable" "$IMG" >/dev/null || exit 1
        CPORT=9187; HP=/metrics ;;
      rest)
        docker exec "$PG" psql -U postgres -q -c "CREATE ROLE authenticator LOGIN PASSWORD 'pw' NOINHERIT; CREATE ROLE anon NOLOGIN; GRANT anon TO authenticator;" >/dev/null 2>&1
        docker run -d --name "$NAME" --network "$NET" -p '127.0.0.1::3000' \
          -e PGRST_DB_URI="postgresql://authenticator:pw@$PG:5432/postgres" \
          -e PGRST_DB_ANON_ROLE=anon -e PGRST_DB_SCHEMAS=public "$IMG" >/dev/null || exit 1
        CPORT=3000; HP=/ ;;
      meta)
        docker run -d --name "$NAME" --network "$NET" -p '127.0.0.1::8080' \
          -e PG_META_DB_HOST="$PG" -e PG_META_DB_PORT=5432 -e PG_META_DB_NAME=postgres \
          -e PG_META_DB_USER=postgres -e PG_META_DB_PASSWORD=pw "$IMG" >/dev/null || exit 1
        CPORT=8080; HP=/health ;;
    esac
    HOSTPORT=$(docker port "$NAME" "$CPORT/tcp" | head -1 | sed 's/.*://')
    [ -z "$HOSTPORT" ] && { echo "  ✗ no published port for $CPORT"; docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    probe "http://127.0.0.1:$HOSTPORT$HP" 200 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;
  *)
    echo "[$SVC] no Tier-1/2 test defined — skipping"
    exit 3
    ;;
esac

echo "[$SVC] candidate image OK"
