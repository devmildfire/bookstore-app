# Infra upgrade 2026-10 — bring the VPS up to the repo, without touching the VPN

**Status:** in progress · **Created:** 2026-10-21 · **Executor:** Claude, unattended for Phases 0–2;
Phase 3 (stateful) waits for an explicit go-ahead.
**Related:** [infra-sync.md](../deployment/infra-sync.md) (the sync protocol this follows),
[dependency-monitoring.md](dependency-monitoring.md), `scripts/vps-guard.sh`, `scripts/supabase-upstream.py`.

## Why
Renovate keeps the **repo** current; infra only reaches the VPS through the manual infra-sync. By
2026-10 the box had drifted far behind (e.g. Prometheus 2.53 vs 3.15 in git, Grafana 11.6 vs 13.2,
storage-api 1.67 vs 1.84) and nothing reported it.

## The box (read-only survey, 2026-10-21)
- 3 vCPU · 8 GB RAM (~5.6 GB available) · 62 GB disk free · Docker 29.5.3 (not auto-upgraded:
  `download.docker.com` isn't an unattended-upgrades origin; automatic reboot off).
- **3 compose projects on one daemon:** `chtivo` (app + Supabase, 10), `monitoring` (9) and
  **`vpn`** (`vpn-3x-ui`, `vpn-web`, `vpn-certbot`) — **must never be disrupted**.
- Isolation: the VPN alone owns host **:80/:443** (+ panel on 127.0.0.1:2053, network `vpnnet`);
  our stacks publish **no host ports** (ingress = Cloudflare tunnel, network `chtivo_default`).
  Shared = daemon, CPU, RAM, disk, bandwidth. `chtivo` and `vpn` containers have **no memory limits**.
- **VPN traffic by hour (7-day avg):** quietest 00:00–03:00 UTC (5–7 Mbit/s), peak 07:00 UTC (21).
- **Backups:** nightly 04:00 UTC (`deploy` user systemd timer, linger), DB dump + storage tarball,
  pulled off-box by the workstation's `chtivo-backup-pull.timer`. Live script was a stale copy
  (no config / encrypted-secrets backup) — fixed in Phase 0.

## Decisions
| # | Decision | Why |
|---|---|---|
| D1 | **Supabase images track Supabase's own self-hosted stack** (`supabase/supabase` `docker/docker-compose.yml`): never ahead of its release line, followed upward weekly by `scripts/supabase-upstream.py` (Renovate disabled for them). A newer *build* of the same line is tolerated (postgres 17.6.1.150 vs upstream .136 — prod already runs it). | Upstream is the integration-tested set; our candidate tests only prove boot/migration compat. Renovate had pushed postgres to 17.11 and storage-api to 1.84. |
| D2 | **postgres stays on 17.6.1.150** (what prod runs). No DB engine change in this programme. | Follows D1; removes the riskiest step. |
| D3 | Windows **00:30–03:00 UTC** (05:30–08:00 UTC+5); never across 04:00 (backup) or 07:00 (VPN peak). | Measured VPN traffic. |
| D4 | Claude executes Phases 0–2 unattended; **Phase 3 needs an explicit go-ahead** after the rehearsal. | Owner choice; stateful changes are irreversible without a restore. |

## Ground rules (every step)
1. **Never touch the shared layer:** no daemon restart/upgrade, nothing in project `vpn`, nothing on
   host :80/:443/:2053, no `docker system|image -a|network|volume prune`, never a bare `docker compose up -d`.
2. **One named service at a time:** `cd <stack> && docker compose up -d --no-deps <svc>`.
3. **Pre-pull** each image first (pulls restart nothing) — keeps bandwidth/disk spikes out of the change.
4. **Guard before and after each step:** `scripts/vps-guard.sh` (VPN running + answering on
   :443/:2053, MemAvailable > 2 GiB, disk > 15 GiB, load < 2, site health 200). **✗ → stop, roll back.**
5. **Rollback = previous image**, kept on the box (record `docker compose images` before; no prune
   until the next day): revert the pin in the stack's compose → `up -d --no-deps <svc>`.
6. Sync files with `tar -x --overwrite` (single-file bind mounts keep their inode — see infra-sync.md);
   run `scripts/check-infra-drift.sh` first and stop on any VPS-ahead drift.

## Phases & tracker
Legend: `[ ]` pending · `[x]` done · `[!]` blocked

### Phase 0 — Prep (no service impact)
- [x] Live backup script = repo `backup.sh` (adds config backup; old kept as `~/chtivo-backup.sh.pre-2026-10-21`).
- [!] **Encrypted secrets backup needs the Owner's GPG _public_ key** on the VPS
      (`gpg --import backup-recipient.pub` as `deploy` + `BACKUP_GPG_RECIPIENT`; see DATABASE_BACKUP.md).
      Until then `.env` / Alertmanager secrets have no backup.
- [x] `scripts/vps-guard.sh` (canary) · `scripts/supabase-upstream.py` + weekly sync job · D1 pins
      (postgres 17.6.1.150, storage-api v1.81.0, studio 2026.10.12) · Tier-3 skips downgrades.

### Phase 1 — Monitoring stack (window 1; no user impact; memory-capped services)
Order, each: guard → pull → recreate → verify target `up`/dashboard → guard.
**[x] Done 2026-10-22 00:37–00:54 UTC** — all 5 steps clean, guard OK before/after every step, nothing
rolled back. Snapshots kept on the box: `~/chtivo-backups/prometheus-data-pre-v3-20261022T0044Z.tar.gz`
(322 MB), `~/chtivo-backups/grafana-data-pre-v12-20261022T0048Z.tar.gz` (13 MB) — delete after ~2 weeks.
1. pushgateway 1.10 → 1.11.4 · node-exporter 1.12.0 → 1.12.1 · alertmanager 0.33.1 → 0.34.1
2. postgres-exporter 0.15 → 0.20.1 (verify `pg_up` + dashboard DB panels)
3. psi-scheduler `node:20` → `node:24.22.0` (verify next PSI push lands in pushgateway)
4. **Prometheus 2.53.2 → 2.55.1 → 3.15.0** — snapshot `monitoring_prometheus_data` (~0.8 GB) first;
   2.55.1 is the last hop that can still be rolled back to after 3.x touches the TSDB.
   Config + all 10 rules validated with promtool on 2.53.2 and 3.15.0.
5. **Grafana 11.6.16 → 12.x → 13.2.4** — back up `monitoring_grafana_data` (27 MB) first (DB
   migrations are one-way). Dashboard uses only built-in panels (timeseries/stat/gauge/row).

### Phase 2 — Production, stateless (window 2; seconds of blip each)
postgres-meta v0.96.6 → v0.100.0 · postgrest v14.10 → v14.18 · studio → 2026.10.12 · kong 3.9.3 → 3.9.4 ·
nginx (same tag, new digest) · **cloudflared last** (only ingress → ~5 s site downtime; VPN unaffected).
Verify after each: guard + `curl` bookstore-app / api / grafana → 200.
**[x] Done 2026-10-23 00:37–00:50 UTC** — all 6 services upgraded, guard OK before/after every step,
no real failure. ⚠ The box compose now pins Phase-3 versions (storage-api v1.81.0, gotrue v2.197.0) while
the old ones run — a bare `docker compose up -d` would upgrade them unrehearsed. Never run one.

### Phase 3 — Production, stateful (window 3, after go-ahead)
- **Rehearsal off-box first:** restore last night's DB dump + storage tarball (workstation copy) into a
  throwaway local stack at prod's versions, run the hops below, smoke-test; and dispatch
  `candidate-image-test.yml` with `base_image` = prod's running version for each hop.
- Live: fresh on-demand backup (`~/chtivo-backup.sh`) → **storage-api v1.67.5 → v1.81.0** → **gotrue
  v2.193.0 → v2.197.0**. postgres unchanged (D2). Never recreate `db`/`storage` volumes; never `db reset`.

### Phase 4 — Keep it from drifting again
- [ ] Weekly read-only **VPS drift line in the digest** ("VPS runs N images older than the repo").
- [ ] Monthly infra window (this doc's rules + guard).
- [ ] Studio healthcheck (probes 127.0.0.1:3000; Studio doesn't listen there → permanently "unhealthy").
- [ ] Memory limits for heavy `chtivo` services once peaks are measured (shields the VPN).

## Log
- 2026-10-18 — cAdvisor TargetDown flapping fixed on the box (#160; lean collectors + 20 s timeout).
- 2026-10-21 — survey; decisions D1–D4; Phase 0 started.
- 2026-10-22 — Phase 1 (window 1, unattended). Drift: monitoring = repo; prod compose repo-ahead only
  (Phase 2 pins). Results: pushgateway 1.11.4, node-exporter 1.12.1, alertmanager 0.34.1 (healthy,
  Prometheus sees it) · postgres-exporter 0.20.1 (`pg_up`=1, all dashboard `pg_*` series present; benign
  WARN "no postgres_exporter.yml") · psi-scheduler node 24.22.0 (first run pushed, perf=90) ·
  Prometheus 2.53.2 → 2.55.1 → 3.15.0 (7/7 targets up, 3 groups / 10 rules health ok, 7-day history
  intact) · Grafana 11.6.16 → 12.4.13 → 13.2.4 (db ok, dashboard 30 panels, `/api/ds/query` OK; benign
  errors for absent provisioning/plugins + /alerting dirs). Box compose md5 = repo HEAD. VPN untouched.
- 2026-10-23 — Phase 2 (window 2, unattended). Drift: only the 8 repo-ahead image pins; db pin = running
  17.6.1.150. Pre-pulled all 6 images, then: postgres-meta v0.100.0 (healthy) · postgrest v14.18 (schema
  cache loaded, 0 errors) · studio 2026.10.12 (Next ready; still "unhealthy" — the known healthcheck
  issue, unchanged) · kong 3.9.4 (healthy) · nginx 1.31-alpine new digest (healthy, `nginx -t` ok) ·
  cloudflared 2026.10.3 (4 tunnel connections registered). Site / book page / grafana 200, api root 404
  (= baseline, no route at `/`). Box compose md5 = repo HEAD. VPN untouched.
  Incidents: (1) meta was rolled back once by a bug in the step helper (trailing space in the URL-check
  string compared ≠ expected); the service itself was fine and was redone. (2) SSH connects to the VPS
  time out in bursts (connection rate limit; fail2ban active) — one studio recreate was silently skipped
  and redone. Use SSH multiplexing (ControlMaster/ControlPersist) for future windows.
