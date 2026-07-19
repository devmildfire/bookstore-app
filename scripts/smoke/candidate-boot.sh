#!/usr/bin/env bash
# Candidate-image test for third-party infra images: boot a candidate image with
# its REAL prod config and prove it starts + serves BEFORE merge — the "inherent
# test" these images otherwise lack. See docs/plans/infra-image-automation.md.
#
# Usage: candidate-boot.sh <service> <candidate-image> [base-image]
#   Tier-1 (config-only, no DB):  nginx, kong, grafana, prometheus, node-exporter,
#                                 pushgateway, alertmanager
#   Tier-2 (throwaway Postgres):  rest (postgrest), meta (postgres-meta), postgres-exporter
#   Tier-3 (migration-compat):    db (postgres), auth (gotrue), storage (storage-api)
#                                 — REQUIRES [base-image]; proves the candidate's boot
#                                 migration applies to a prod-like schema AND the old
#                                 version still serves the migrated schema (safe upgrade).
# Exit: 0 = candidate healthy · 1 = failed · 3 = no candidate test for this service (skip).
set -uo pipefail
SVC="${1:?usage: candidate-boot.sh <service> <candidate-image> [base-image]}"
IMG="${2:?usage: candidate-boot.sh <service> <candidate-image> [base-image]}"
BASE_IMG="${3:-}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
NAME="smoke-cand-${SVC}-$$"
NAME2="smoke-base-${SVC}-$$"   # Tier-3: the base-version container (compat check)
PG=""    # Tier-2/3: throwaway postgres container
NET=""   # Tier-2/3: throwaway docker network
VOL=""   # Tier-3 (db): shared data volume across base→candidate boots
cleanup() {
  docker rm -f "$NAME" "$NAME2" >/dev/null 2>&1 || true
  [ -n "$PG" ]  && docker rm -f "$PG"  >/dev/null 2>&1 || true
  [ -n "$NET" ] && docker network rm "$NET" >/dev/null 2>&1 || true
  [ -n "$VOL" ] && docker volume rm "$VOL" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Poll a URL until it returns the expected status (services take a moment to bind).
probe() {
  local url="$1" exp="$2" code=""
  for _ in $(seq 1 30); do
    code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$url" 2>/dev/null)
    [ "$code" = "$exp" ] && { echo "  ✓ $url → $code"; return 0; }
    sleep 1
  done
  echo "  ✗ $url → ${code:-timeout} (expected $exp)"
  return 1
}
wait_pg() { for _ in $(seq 1 40); do docker exec "$1" pg_isready -U postgres >/dev/null 2>&1 && return 0; sleep 1; done; return 1; }
hostport() { docker port "$1" "$2/tcp" | head -1 | sed 's/.*://'; }
# Mint an HS256 JWT (stdlib only) so storage/auth accept the anon/service keys at boot.
mint_jwt() {
  python3 - "$1" "$2" <<'PY'
import sys,hmac,hashlib,base64,json
role,secret=sys.argv[1],sys.argv[2]
b=lambda x: base64.urlsafe_b64encode(x).rstrip(b'=')
h=b(json.dumps({"alg":"HS256","typ":"JWT"},separators=(',',':')).encode())
p=b(json.dumps({"role":role,"iss":"supabase","iat":0,"exp":9999999999},separators=(',',':')).encode())
s=b(hmac.new(secret.encode(),h+b'.'+p,hashlib.sha256).digest())
print((h+b'.'+p+b'.'+s).decode())
PY
}

# The throwaway Postgres for Tier-3 auth/storage = the prod postgres image (bakes the
# supabase roles/schemas the services migrate against). Read it from the head compose.
prod_pg_image() {
  grep -oE 'public\.ecr\.aws/supabase/postgres:[^"[:space:]]+' \
    "$ROOT/deploy/production/docker-compose.yml" | head -1
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
    case "$SVC" in
      grafana)       CPORT=3000; HP=/api/health ;;
      prometheus)    CPORT=9090; HP=/-/healthy ;;
      node-exporter) CPORT=9100; HP=/metrics ;;
      pushgateway)   CPORT=9091; HP=/-/ready ;;
      alertmanager)  CPORT=9093; HP=/-/healthy ;;
    esac
    echo "[$SVC] boot $IMG + probe $HP (standalone)"
    docker run -d --name "$NAME" -p "127.0.0.1::$CPORT" "$IMG" >/dev/null || exit 1
    HOSTPORT=$(hostport "$NAME" "$CPORT")
    [ -z "$HOSTPORT" ] && { echo "  ✗ no published port for $CPORT"; docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    probe "http://127.0.0.1:$HOSTPORT$HP" 200 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;
  rest | meta | postgres-exporter)
    # Tier-2: DB-coupled (compose service names: rest=postgrest, meta=postgres-meta).
    NET="smoke-net-$$"; PG="smoke-pg-$$"
    docker network create "$NET" >/dev/null 2>&1 || exit 1
    echo "[$SVC] boot throwaway postgres"
    docker run -d --name "$PG" --network "$NET" -e POSTGRES_PASSWORD=pw postgres:16-alpine >/dev/null || exit 1
    wait_pg "$PG" || { echo "  ✗ throwaway postgres never ready"; exit 1; }
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
    HOSTPORT=$(hostport "$NAME" "$CPORT")
    [ -z "$HOSTPORT" ] && { echo "  ✗ no published port for $CPORT"; docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    probe "http://127.0.0.1:$HOSTPORT$HP" 200 || { docker logs "$NAME" 2>&1 | tail -20; exit 1; }
    ;;

  # ── Tier-3: migration-compat gate for the (formerly frozen) stateful trio ───────
  db)
    # Postgres data-dir compatibility: can the CANDIDATE start on a data dir written
    # by the BASE image, with data intact? Minor (same on-disk format) → yes. A major
    # (17→18) cannot start on the old catalog → this FAILS, correctly gating majors.
    [ -n "$BASE_IMG" ] || { echo "[db] Tier-3 needs a base image (arg 3)"; exit 1; }
    VOL="smoke-pgdata-$$"; docker volume create "$VOL" >/dev/null || exit 1
    echo "[db] init data dir with BASE ($BASE_IMG) + write canary"
    docker run -d --name "$NAME2" -e POSTGRES_PASSWORD=pw \
      -v "$VOL:/var/lib/postgresql/data" "$BASE_IMG" >/dev/null || exit 1
    wait_pg "$NAME2" || { echo "  ✗ base postgres never ready"; docker logs "$NAME2" 2>&1 | tail -25; exit 1; }
    docker exec "$NAME2" psql -U postgres -q \
      -c "CREATE TABLE canary(id int primary key, v text); INSERT INTO canary VALUES (1,'survived');" \
      || { echo "  ✗ could not seed canary"; exit 1; }
    docker rm -f "$NAME2" >/dev/null 2>&1; NAME2=""
    echo "[db] start CANDIDATE ($IMG) on the SAME data dir"
    docker run -d --name "$NAME" -e POSTGRES_PASSWORD=pw \
      -v "$VOL:/var/lib/postgresql/data" "$IMG" >/dev/null || exit 1
    if ! wait_pg "$NAME"; then
      echo "  ✗ candidate could NOT start on the base data dir (on-disk incompatible — likely a MAJOR needing pg_upgrade)"
      docker logs "$NAME" 2>&1 | tail -25; exit 1
    fi
    got=$(docker exec "$NAME" psql -U postgres -tAc "SELECT v FROM canary WHERE id=1" 2>/dev/null | tr -d '[:space:]')
    [ "$got" = "survived" ] && echo "  ✓ candidate booted on base data dir; canary intact" \
      || { echo "  ✗ data not intact after upgrade (got '$got')"; docker logs "$NAME" 2>&1 | tail -25; exit 1; }
    ;;
  auth | storage)
    # Boot-migration compatibility for gotrue/storage-api:
    #   1) base version migrates a prod-image DB to the CURRENT schema state
    #   2) candidate migrates on top and comes up healthy   (migration applies cleanly)
    #   3) base version boots again on the candidate-migrated schema, still healthy
    #      (expand-compatible → old code tolerates new schema → safe rollback/blue-green)
    [ -n "$BASE_IMG" ] || { echo "[$SVC] Tier-3 needs a base image (arg 3)"; exit 1; }
    PGIMG=$(prod_pg_image); [ -n "$PGIMG" ] || { echo "[$SVC] could not resolve prod postgres image"; exit 1; }
    NET="smoke-net-$$"; PG="smoke-pg-$$"
    SECRET="super-secret-jwt-token-with-at-least-32-chars"
    ANON=$(mint_jwt anon "$SECRET"); SERVICE=$(mint_jwt service_role "$SECRET")
    docker network create "$NET" >/dev/null 2>&1 || exit 1
    echo "[$SVC] boot throwaway prod-postgres ($PGIMG)"
    docker run -d --name "$PG" --network "$NET" -e POSTGRES_PASSWORD=pw "$PGIMG" >/dev/null || exit 1
    wait_pg "$PG" || { echo "  ✗ throwaway postgres never ready"; docker logs "$PG" 2>&1 | tail -25; exit 1; }
    # Connect as the postgres SUPERUSER (password = POSTGRES_PASSWORD = pw) in this
    # disposable DB, so the test measures MIGRATION compatibility, not privilege
    # plumbing (the baked supabase_*_admin roles have no known login password here).

    # Build a gotrue/storage run (base and candidate share the same env).
    run_svc() { # $1=container-name $2=image
      if [ "$SVC" = auth ]; then
        docker run -d --name "$1" --network "$NET" -p '127.0.0.1::9999' \
          -e GOTRUE_DB_DRIVER=postgres \
          -e GOTRUE_DB_DATABASE_URL="postgres://postgres:pw@$PG:5432/postgres" \
          -e GOTRUE_API_HOST=0.0.0.0 -e GOTRUE_API_PORT=9999 \
          -e API_EXTERNAL_URL=http://localhost:9999 \
          -e GOTRUE_SITE_URL=http://localhost -e GOTRUE_JWT_SECRET="$SECRET" \
          -e GOTRUE_JWT_ADMIN_ROLES=service_role -e GOTRUE_JWT_AUD=authenticated \
          -e GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated \
          -e GOTRUE_EXTERNAL_EMAIL_ENABLED=true -e GOTRUE_MAILER_AUTOCONFIRM=true \
          "$2" >/dev/null
      else
        docker run -d --name "$1" --network "$NET" -p '127.0.0.1::5000' \
          -e ANON_KEY="$ANON" -e SERVICE_KEY="$SERVICE" -e AUTH_JWT_SECRET="$SECRET" \
          -e DATABASE_URL="postgres://postgres:pw@$PG:5432/postgres" \
          -e POSTGREST_URL=http://localhost:3000 \
          -e FILE_SIZE_LIMIT=52428800 -e STORAGE_BACKEND=file \
          -e FILE_STORAGE_BACKEND_PATH=/tmp/stg -e TENANT_ID=stub -e REGION=local \
          -e GLOBAL_S3_BUCKET=stub -e ENABLE_IMAGE_TRANSFORMATION=false \
          "$2" >/dev/null
      fi
    }
    [ "$SVC" = auth ] && { CPORT=9999; HP=/health; } || { CPORT=5000; HP=/status; }

    echo "[$SVC] (1/3) base $BASE_IMG migrates the DB to current schema"
    run_svc "$NAME2" "$BASE_IMG" || exit 1
    probe "http://127.0.0.1:$(hostport "$NAME2" "$CPORT")$HP" 200 \
      || { echo "  ✗ BASE never healthy (test setup problem, not the candidate)"; docker logs "$NAME2" 2>&1 | tail -30; exit 1; }
    docker rm -f "$NAME2" >/dev/null 2>&1; NAME2=""

    echo "[$SVC] (2/3) candidate $IMG applies its migration + serves"
    run_svc "$NAME" "$IMG" || exit 1
    probe "http://127.0.0.1:$(hostport "$NAME" "$CPORT")$HP" 200 \
      || { echo "  ✗ CANDIDATE migration/boot FAILED"; docker logs "$NAME" 2>&1 | tail -30; exit 1; }
    docker rm -f "$NAME" >/dev/null 2>&1

    echo "[$SVC] (3/3) base $BASE_IMG still serves the candidate-migrated schema (expand-compat)"
    run_svc "$NAME2" "$BASE_IMG" || exit 1
    probe "http://127.0.0.1:$(hostport "$NAME2" "$CPORT")$HP" 200 \
      || { echo "  ✗ NOT expand-compatible: old version cannot serve new schema (needs a maintenance window, not blue-green)"; docker logs "$NAME2" 2>&1 | tail -30; exit 1; }
    ;;
  *)
    echo "[$SVC] no candidate test defined — skipping"
    exit 3
    ;;
esac

echo "[$SVC] candidate image OK"
