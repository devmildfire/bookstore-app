# Production stack (`/opt/chtivo`) — DRAFT

Single VPS (`<vps-ip>`, zone `mildfire.dev`). **Cloudflare Tunnel** is the only
ingress; no host ports are published. `cloudflared → nginx → {app, kong}`. Postgres and
Studio stay private.

```
Browser → Cloudflare (DNS/TLS/WAF) → Tunnel → cloudflared → nginx ┬─ bookstore-app.mildfire.dev → app:3000
                                                                  └─ api.mildfire.dev        → kong:8000 → auth/rest/storage/realtime
                                                          (private) db:5432 · studio · meta
```

## Files
- `docker-compose.yml` — the full stack (Supabase trimmed + app + nginx + cloudflared).
- `.env.example` — copy to `.env` on the VPS, fill real values, `chmod 600`. Never commit `.env`.
- `nginx/conf.d/app.conf` — Host-based routing, real visitor IP, websocket + upload limits.
- `volumes/db/*.sql` — first-init scripts (role passwords from `POSTGRES_PASSWORD`, JWT GUCs, realtime/webhooks).
- `volumes/api/kong.yml`, `kong-entrypoint.sh` — Supabase API gateway routes (env-templated keys).

## Version pinning rationale
Stateful services whose migration state is inside the restored dump are pinned to the
**exact local versions**: `postgres 17.6.1.106`, `gotrue v2.188.1`, `storage-api v1.54.1`,
`realtime v2.86.3`. The dump is Postgres 17 — it will **not** restore into Postgres 15.
Stateless services (kong/rest/meta/studio) use tested official versions.

## ⚠️ Generate FRESH production secrets (do NOT reuse local)
The local dev stack uses the **public Supabase demo keys** (`…supabase-demo…` JWTs,
`sb_secret_N7UND0…`). Reusing them in production = anyone can mint `service_role` tokens.
Generate fresh values into `.env` (see `.env.example` header). `ANON_KEY` and
`SERVICE_ROLE_KEY` must be JWTs signed with the **new** `JWT_SECRET` (roles `anon` /
`service_role`). After generating, the app's `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the new
`ANON_KEY` (already wired via `${ANON_KEY}`).

## Cloudflare Tunnel
Token-based tunnel: create it in Zero Trust → Networks → Tunnels, put the token in
`CLOUDFLARE_TUNNEL_TOKEN`. Add public hostnames (all → the internal nginx):
- `bookstore-app.mildfire.dev` → `http://nginx:80`
- `api.mildfire.dev` → `http://nginx:80`

With the tunnel live, **close public 80/443 in UFW** (only SSH stays open) — the origin is
no longer directly reachable.

## Bootstrap restore (uses the staged pair in `~/chtivo-bootstrap`)
The consistent dump+storage pair is already on the VPS at `/home/deploy/chtivo-bootstrap/`
(`chtivo-local-full-20260615-122233.dump`, `chtivo-local-storage-20260615-122233.tar.gz`).

1. `cp -r` this directory to `/opt/chtivo`, create `.env`, `docker compose up -d db` (let it
   first-init: roles.sql sets role passwords).
2. Restore the DB into the fresh `db`:
   ```bash
   cat ~/chtivo-bootstrap/chtivo-local-full-20260615-122233.dump | \
     docker compose exec -T db pg_restore -U postgres -d postgres \
       --clean --if-exists --no-owner --no-privileges
   ```
3. Restore storage into the `chtivo_storage-data` volume **before** starting `storage`:
   ```bash
   docker run --rm -v chtivo_storage-data:/to -v ~/chtivo-bootstrap:/from:ro \
     alpine sh -c 'cd /to && tar xzf /from/chtivo-local-storage-20260615-122233.tar.gz'
   ```
4. `docker compose up -d` (rest of the stack), then smoke-test via `api.mildfire.dev` and
   `bookstore-app.mildfire.dev`. Admin login: `chtivoadmin@example.com` / `<admin-password>`.

## ⛔ NOT YET REHEARSED — verify locally before trusting this
This draft has not been brought up end-to-end. Rehearse on the local machine with the
pinned images + the dump, and confirm:
- **DB restore + roles**: after `db` first-init (`roles.sql`) + `pg_restore --no-owner
  --no-privileges`, do `auth`/`storage`/`rest` connect, and do RLS policies referencing
  `anon`/`authenticated`/`service_role` still work? (Grants were stripped by
  `--no-privileges` — may need a re-grant pass, or restore with privileges.)
- **Storage layout**: does `storage-api v1.54.1` with `FILE_STORAGE_BACKEND_PATH=/mnt` +
  `GLOBAL_S3_BUCKET=stub` resolve the restored `/mnt/stub/stub/<bucket>/...` files?
- **Kong**: `kong/kong:3.9.1` + the env-templated `kong.yml` serve `/auth /rest /storage
  /realtime` with the fresh keys.
- **Send-email hook**: `GOTRUE_HOOK_SEND_EMAIL_URI=http://app:3000/...` reaches the app and
  the Standard-Webhooks signature verifies with the prod `SEND_EMAIL_HOOK_SECRET`.

Recommended: stand the whole compose up locally (override the tunnel with a temporary host
port on nginx), restore the pair, fix what breaks, THEN deploy the verified config.
