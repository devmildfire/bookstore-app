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
- `volumes/db/*.sql` — first-init scripts (role passwords from `POSTGRES_PASSWORD`, JWT GUCs, webhooks).
- `volumes/db/post-restore-grants.sql` — security re-grant pass; run after **every** restore (last).
- `volumes/api/kong.yml` — minimal static API gateway config (routes + CORS), mounted read-only.

## Deploy model — code is automated, infra is manual
The GitHub Actions workflow (`.github/workflows/deploy-production.yml`, on push to
`production`) **only rolls the app image**: it builds + pushes the GHCR image, then SSHes
in and runs `docker compose pull app && docker compose up -d app`. It does **not** touch
the files in `/opt/chtivo`.

So changes to **`docker-compose.yml`, `.env`, `nginx/`, `volumes/`** are NOT picked up by a
normal deploy — they must be synced to the VPS by hand, then the affected service recreated:

```bash
# From the repo (syncs all tracked deploy/ files; the gitignored .env is left untouched):
git archive --format=tar HEAD:deploy/production | ssh portfolio-vps 'tar -x -C /opt/chtivo'
# Then recreate whatever changed, e.g.:
ssh portfolio-vps 'cd /opt/chtivo && docker compose up -d app'
```

`.env` itself is never in git — edit `/opt/chtivo/.env` directly on the VPS and
`docker compose up -d <service>` to apply. (This split is deliberate: image rolls are
frequent + safe to automate; infra changes are rare and shouldn't restart the DB/auth on
every code deploy.)

## Version pinning rationale
Stateful services whose migration state is inside the restored dump are pinned to the
**exact local versions**: `postgres 17.6.1.106`, `gotrue v2.188.1`, `storage-api v1.54.1`.
The dump is Postgres 17 — it will **not** restore into Postgres 15. Stateless services
(kong/rest/meta/studio) use tested official versions. **Realtime is not deployed** (the app
uses none); Kong runs `kong/kong:3.9.1` with a minimal static config, not the Supabase Kong
image.

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

## Bootstrap restore (rehearsed locally end-to-end 2026-06-15)
Full sequence + rationale: [docs/deployment/supabase-production-bootstrap.md](../../docs/deployment/supabase-production-bootstrap.md#production-restore).

> ⚠️ **Re-stage the corrected pair first.** The originally-staged files in
> `~/chtivo-bootstrap/` are **both wrong** and must be replaced:
> - DB dump `…-122233.dump` was made with `--no-owner --no-privileges` → breaks the Storage
>   API. Use **`chtivo-local-full-20260615-owned.dump`** (dumped with ownership + privileges).
> - Storage `…-122233.tar.gz` has **no xattrs** → every object GET 500s. Use
>   **`chtivo-local-storage-20260615-140111-xattrs.tar.gz`** (created with `--xattrs`).

1. `cp -r` the bundle to `/opt/chtivo`, create `.env` (`chmod 600`), `docker compose up -d db`
   (let it first-init: `roles.sql` sets role passwords).
2. Restore the DB into the fresh `db` — **as `supabase_admin`, with owners/privileges**:
   ```bash
   cat ~/chtivo-bootstrap/chtivo-local-full-20260615-owned.dump | \
     docker compose exec -T db pg_restore -U supabase_admin -d postgres --clean --if-exists
   ```
   (Benign: `role "supabase_realtime_admin" does not exist` + one `graphql` grant.)
3. Re-apply the security grants (**last**, after the final restore):
   ```bash
   docker compose exec -T db psql -U supabase_admin -d postgres \
     -v ON_ERROR_STOP=1 -f - < volumes/db/post-restore-grants.sql
   ```
4. Restore storage into the `chtivo_storage-data` volume **before** starting `storage`,
   **with xattrs**:
   ```bash
   docker run --rm -v chtivo_storage-data:/to -v ~/chtivo-bootstrap:/from:ro \
     alpine sh -c 'apk add -q tar attr gzip && cd /to && \
       tar --xattrs --xattrs-include="user.*" -xzf /from/chtivo-local-storage-20260615-140111-xattrs.tar.gz'
   ```
5. `docker compose up -d` (rest of the stack), then smoke-test via `api.mildfire.dev` and
   `bookstore-app.mildfire.dev`. Admin login: `chtivoadmin@example.com` / `<admin-password>`.

## ✅ Rehearsed locally — what was verified
Stood the whole compose up locally (tunnel disabled, temp host port `8088` on nginx),
restored the pair, fixed every break. Confirmed through nginx (`Host: api.mildfire.dev`):
- **DB restore + roles**: restore as `supabase_admin` with owners/privileges; `auth` /
  `storage` / `rest` all connect; post-restore-grants re-locks anon writes + the admin RPC.
- **REST**: `/rest/v1/Titles` → 206, 69 titles (PostgREST must start *after* the restore).
- **Storage**: public cover → 200 `image/jpeg` (xattr-restored content-type); anon GET on a
  private `digital-files` object → 400 (RLS); `service_role` signs a URL → fetch 200
  `application/pdf` 11.7 MB.
- **Auth**: `/auth/v1/health` → 200 (GoTrue v2.188.1); send-email hook URI uses the public
  `https` base (GoTrue rejects non-loopback `http`).
- **Kong**: minimal static `kong.yml` (routes + CORS) serves `/auth /rest /storage`.
- **nginx**: resolver + variable upstreams; bad `Host` → `444`.

Still unverified locally (needs the built app image — CI/CD builds it; prod will have it):
the app container itself, OAuth, checkout/payment, and the live send-email hook signature.
