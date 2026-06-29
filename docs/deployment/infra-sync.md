# Infra Sync Protocol (`/opt/chtivo`)

How to apply repo **infra** config (`deploy/production/` + `monitoring/`) to the VPS **deliberately
and safely**. App *image* rolls are automated (`deploy-production.yml`); **infra is manual** — and a
careless sync can break live services.

> **Why this doc exists (the incident):** `grafana.mildfire.dev` returned 502 after a sync. The
> grafana nginx `server` block existed **only on the VPS** (never committed). The sync's `tar -x`
> overwrote `nginx/conf.d/app.conf` with the repo version (no grafana block) → unmatched Host →
> nginx `444` → cloudflared `EOF` → 502. **Root lesson below.**

## The golden rule

> The sync **overwrites** every tracked file on the VPS with the repo version. So **any VPS-only
> edit to a tracked file is destroyed by a sync.** Before syncing, the **repo must be the source of
> truth** — capture any on-box drift into git *first*.

## The two infra stacks (separate, never combined)

| Stack | Repo path | VPS path | Services |
|---|---|---|---|
| Production | `deploy/production/` | `/opt/chtivo/` | app, nginx, kong, cloudflared, Supabase (db/auth/rest/storage/meta) |
| Monitoring | `monitoring/` | `/opt/chtivo/monitoring/` | prometheus, grafana, alertmanager, exporters, psi-scheduler |

`.env`, `alertmanager.yml`, `telegram_token` are **gitignored** → never in the archive, never touched
by a sync. (Correct — they hold secrets and are intentionally VPS-only.)

## Procedure

### 1. Pre-sync — ALWAYS audit for drift first
```bash
git checkout main && git pull --ff-only            # repo = what you intend to deploy
scripts/check-infra-drift.sh                        # diff repo(origin/main) vs VPS, every tracked file
```
For each `✗ DIFFERS` / `⚠ MISSING`, decide the **direction**:
- **VPS-ahead** (the box has edits not in git) → **STOP.** Commit them to the repo first (PR → merge),
  or the sync will wipe them. *This is the grafana failure mode.*
- **repo-ahead** (repo changed, VPS behind) → that's exactly what you're deploying. Eyeball the diff.
- `⚠ MISSING` → a tracked file isn't at the mapped VPS path; investigate before assuming.

Only proceed when every diff is understood and the repo is authoritative.

### 2. Sync the files (one stack at a time)
```bash
# Production infra:
git archive --format=tar origin/main:deploy/production | ssh portfolio-vps 'tar -x -C /opt/chtivo'
# Monitoring infra:
git archive --format=tar origin/main:monitoring       | ssh portfolio-vps 'tar -x -C /opt/chtivo/monitoring'
```
`tar -x` overwrites tracked files; it does **not** delete extra on-box files, and leaves the
gitignored `.env`/secrets alone.

### 3. Apply — recreate ONLY what changed (never a bare `up -d`)
| Changed | Apply |
|---|---|
| **nginx config** (`app.conf`, …) | `ssh portfolio-vps 'docker exec chtivo-nginx-1 nginx -t && docker exec chtivo-nginx-1 nginx -s reload'` — **zero-downtime; no recreate**. `nginx -t` first: a bad config won't reload. |
| **a service image/env** (kong, meta, grafana, prometheus, …) | `ssh portfolio-vps 'cd <stack-dir> && docker compose pull <svc> && docker compose up -d <svc>'` — name the services explicitly |
| **cloudflared** | same as above — but ⚠ it's the **only ingress**, so recreate = a few seconds of site downtime |

**Hard limits:**
- 🚫 **Never** a bare `docker compose up -d` (no service args) — it reconciles *every* service against
  the new compose and can recreate things you didn't intend.
- 🚫 **Never** recreate / down `db` or `storage`, and **never `db reset`**. Storage has no restore
  source — see the PRIME DIRECTIVE in `AGENTS.md`. If infra work could touch the DB/storage, take a
  fresh backup and get explicit sign-off first.

### 4. Verify
```bash
# Hostnames that should be 200:
for h in bookstore-app api grafana; do
  curl -s -o /dev/null -w "$h: %{http_code}\n" "https://$h.mildfire.dev/"; done
ssh portfolio-vps 'cd /opt/chtivo && docker compose ps'        # + .../monitoring for that stack
```

## Routing note (so the grafana class of bug can't recur)
Every public hostname goes **Cloudflare Tunnel → nginx → service** — including
`grafana.mildfire.dev` (→ `grafana:3000`). So **every hostname needs a matching nginx `server`
block in `deploy/production/nginx/conf.d/app.conf`** (now incl. grafana). If you add a tunnel
hostname, add its nginx vhost **in the repo** — never only on the box.

## Known follow-ups
- `monitoring/nginx/00-red-logging.conf` is stored under `monitoring/` in the repo but is actually
  deployed into the *production* nginx (`/opt/chtivo/nginx/conf.d/`). Harmless (sync can't wipe it),
  but the repo path should move under `deploy/production/nginx/conf.d/` for clarity.
