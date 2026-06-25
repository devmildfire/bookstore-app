# Observability & Monitoring

**Status:** planned (see [implementation plan](../plans/monitoring-observability.md) for phases &
acceptance; [DECISIONS.md](./DECISIONS.md) for the architecture-decision records).

A self-hosted Prometheus + Grafana observability stack for the chtivo storefront, structured around
the industry-standard **three pillars + synthetic** model. This document is the durable architecture
reference (and the seed for the project README's monitoring section). Operational runbook + dashboard
screenshots are added in Phase 6.

---

## Why this exists

Two goals, deliberately both:

1. **Utility** — if a metric regresses (perf, container CPU/RAM, error rate, DB health) we get paged
   and have history to diagnose.
2. **Showcase** — this is a portfolio project. The monitoring is itself a deliverable that
   demonstrates fluency with production observability — Prometheus, Grafana, exporters, PromQL, and
   **SLO/burn-rate alerting** — done to a senior standard, not a utility only its author understands.

A cheaper cron+Supabase+ntfy approach would satisfy (1) alone; it was rejected for (2). See
[ADR-0001](./DECISIONS.md#adr-0001).

---

## The model: four vantage points

Each pillar observes the same system from a different position. Their value is **triangulation** — a
fault shows in some pillars and not others, and that *pattern* locates the problem.

| Pillar | Method | Vantage | Watches | Tools |
|---|---|---|---|---|
| **Infra** | **USE** | the machine | per-resource Utilization, Saturation, Errors (CPU, mem, disk, net — host + per-container) | node-exporter, cAdvisor, postgres-exporter |
| **App** | **RED** | the service | per-service Request rate, Error rate, request Duration | `prom-client` in Next → `/metrics` |
| **Real users** | **RUM / CWV** | the browser | real-visitor Core Web Vitals (LCP, INP, CLS) at p75 | `web-vitals` → `/api/vitals` → histograms |
| **Synthetic** | PSI | a robot user | scheduled lab probe of perf/LCP/CLS — works at zero traffic | PSI cron → Pushgateway |

### Method definitions

- **USE** (Brendan Gregg) — for every *resource*: **U**tilization (how busy), **S**aturation (how
  much work is queued because it's full — swap, run-queue, I/O wait; often the more important
  signal), **E**rrors (OOM-kills, dropped packets). Answers *"is a resource running out/overwhelmed?"*
- **RED** (Tom Wilkie) — for every *service*: **R**ate (req/s), **E**rrors (failed req/s), **D**uration
  (latency p50/p95/p99). Answers *"is the service serving requests fast and without failing?"*
  USE and RED are complements: resources (consumed) vs services (handle requests). Both descend from
  Google SRE's **Four Golden Signals** (Latency, Traffic, Errors, Saturation).
- **RUM / CWV** — Real User Monitoring measures in the *actual browser* (the server can be fast while
  the experience is slow). **Core Web Vitals**: **LCP** loading <2.5 s, **INP** interactivity <200 ms,
  **CLS** visual stability <0.1, judged at **p75**. Works at any traffic level (unlike Google CrUX,
  which needs a popularity threshold this site won't reach).
- **Synthetic** — actively probes on a schedule from a controlled environment (PageSpeed Insights /
  Lighthouse). Gives a consistent always-on signal even with no real traffic.

> **Triangulation, by example.** The 2026-06-23 PSI scare: USE green, RED green (TTFB 16 ms),
> RUM green (real LCP ~365 ms), only Synthetic moved (lab 96→93). Three pillars green + one synthetic
> drop reads *immediately* as a measurement artifact (Lighthouse 13.4.0 recalibration), not a
> regression — the conclusion that took a long manual investigation. See
> [docs/perf/psi-baseline.md](../perf/psi-baseline.md).

---

## Architecture

```
                ┌──────────────── VPS (docker-compose, pinned, internal network) ────────────────┐
 real users ─ web-vitals beacon ─▶ Next app ─ /metrics (prom-client: RED + RUM) ─┐                │
                │  cAdvisor (per-container USE) ─────────────────────────────┐   │                │
                │  node-exporter (host USE) ──────────────────────────────┐  │   │                │
                │  postgres-exporter (DB) ─────────────────────────────┐  │  │   │                │
 PSI cron ──push──▶ Pushgateway ───────────────────────────────────┐  │  │  │   │                │
                │                                                   ▼  ▼  ▼  ▼   ▼                │
                │                                                    Prometheus ─▶ Alertmanager ─▶ Telegram
                │                                                        │                         │
                │                                                     Grafana ◀─ PromQL            │
                └────────────────────────────────────────────────────────┬──────────────────────────┘
                                                  grafana.<domain> (CF tunnel, anonymous Viewer = public read-only)
```

Only **Grafana** is exposed (read-only). Prometheus, Alertmanager, Pushgateway and all exporters are
internal-only. PSI synthetic runs as a VPS systemd timer pushing to an internal Pushgateway (the
canonical tool for periodic batch-job metrics) — see [ADR-0003](./DECISIONS.md#adr-0003).

### Components & resource budget (VPS: 3 vCPU / 8 GB / ~6 GB free)

| Component | `mem_limit` | Role |
|---|---|---|
| Prometheus | 512 MB | scrape + TSDB (retention capped 15 d) |
| Grafana | 256 MB | dashboards (public read-only) |
| cAdvisor | 256 MB | per-container USE (main CPU user) |
| node-exporter / postgres-exporter | 64 / 128 MB | host USE / DB metrics |
| Alertmanager / Pushgateway | 64 / 64 MB | alert routing / synthetic ingest |

Expected ~0.6–0.75 GB (~12% of available RAM), ~half the existing app-stack footprint → no swap, no
observer-effect. See [ADR-0002](./DECISIONS.md#adr-0002).

---

## Dashboards

A glance-screen on top, five drill-downs beneath (provisioned as version-controlled JSON — no
click-ops).

| # | Dashboard | Shows |
|---|---|---|
| 1 | **Overview** | one health number per pillar: app up, req rate, error %, p95 latency, p75 LCP, top container mem, DB connections |
| 2 | **Infra / USE** | per-container CPU/mem (table + series), host CPU/load/mem/disk, saturation (swap, throttling, I/O wait) |
| 3 | **App / RED** | request rate by route-class, error rate by status, latency p50/p95/p99 |
| 4 | **Core Web Vitals** | p75 LCP/INP/CLS over time with threshold lines, split by device |
| 5 | **Synthetic (PSI)** | lab perf + LCP/FCP/CLS median trend, annotated with deploy markers |
| 6 | **Database** | connections vs max, cache-hit ratio, tx rate, locks, size growth |

Convention: **percentiles, not averages** (p95/p99 latency, p75 vitals) — averages hide the bad tail.

---

## SLOs & burn-rate alerting

Reliability is expressed as **SLIs → SLOs → error budgets**, not bare thresholds.

- **SLI** — a measured ratio reflecting user happiness (e.g. % of requests < 500 ms).
- **SLO** — its target over a window (e.g. 99.5% success over 30 d). The allowed 0.5% failure is the
  **error budget**.
- **Burn rate** — how fast the budget is being spent. 1× = exhausts exactly at window end; 10× =
  exhausts in ~3 days → page. Alerts scale with severity instead of a flat line.
- **Multi-window** (Google SRE) — require a fast (1 h) *and* slow (6 h) window to both be burning
  before paging: fast catches acute issues, slow confirms they're sustained → kills false pages.

Starting SLOs (tune after baseline):

| SLO | Target | Source |
|---|---|---|
| Availability | 99.5% 2xx/3xx | synthetic / RED |
| Latency | p95 < 500 ms | RED |
| Error rate | 5xx < 1% | RED |
| Field LCP | p75 < 2.5 s | RUM |

User-experience metrics get **burn-rate** alerts; binary infra catastrophes (disk > 85%, OOM/restart
loop, host down) get plain **threshold guards**. **Alertmanager** groups, inhibits (root cause over
symptoms), silences (maintenance), and routes to Telegram. See [ADR-0005](./DECISIONS.md#adr-0005).

---

## Deployment & security

- Self-hosted in `monitoring/` compose on the existing internal Docker network.
- **Only Grafana exposed** via the CF tunnel; **anonymous org role = Viewer** → public read-only
  dashboards, admin stays password-protected. Everything else internal-only.
  See [ADR-0006](./DECISIONS.md#adr-0006).
- **Secrets** (PSI key, Telegram token, Grafana admin pw) in root-only env files, never committed.
- **Pinned** image versions (matches the repo's exact-pin policy).
- **Label hygiene** — low-cardinality labels only (`page_type`, `device` — never URLs, user-ids, or
  internal hostnames): high cardinality balloons Prometheus *and* labels are publicly visible.
- **Cost: $0 incremental** — existing VPS, free GitHub, free CF tunnel.

---

## Deployment notes (as built — Phases 0–3, 2026-06-24)

Live: **https://grafana.mildfire.dev** (anonymous read-only). Stack at `/opt/chtivo/monitoring/`
on the VPS (`docker compose -p monitoring --env-file .env up -d`); source of truth is `monitoring/`
in this repo. Grafana admin password is in the VPS `.env` (`GRAFANA_ADMIN_PASSWORD`, never committed).

**cAdvisor config — why `v0.55.1` + `cgroup: host`:** this host runs Docker on the **containerd
snapshotter** (`Storage Driver: overlayfs`) with **cgroup v2 + cgroupns**. Both settings are required
or cAdvisor reports *zero* per-container metrics: `cgroup: host` so it can see other containers'
cgroups (not just its own namespace), and **≥ v0.55** because earlier versions can't read the
containerd snapshotter's layer metadata (there's no classic `overlay2/layerdb`). A stock cAdvisor
compose silently produces nothing here — check `docker info` (storage driver + cgroup version) before
trusting one.

**Exposure (how Grafana was published):**
1. **nginx** (`/opt/chtivo/nginx/conf.d/app.conf`) — added a `server { server_name grafana.mildfire.dev; … proxy_pass http://$grafana_upstream; }` block (variable upstream + `resolver 127.0.0.11` so it survives container IP changes), mirroring the app/api blocks. `nginx -t` then `nginx -s reload`.
2. **Cloudflare tunnel** (`chtivo-vps`) — token-managed, so routing is in the dashboard under
   **Connectors → chtivo-vps → Published application routes** (the new name for public hostnames):
   added `grafana.mildfire.dev → http://nginx:80`, path `*`, matching the existing `bookstore-app`/`api`
   routes. This auto-created the DNS record. Request path: CF edge → tunnel → `nginx:80` (Host-routed)
   → `grafana:3000`.

**App RED (Phase 2) — measured at the nginx ingress:** Next's App Router has no clean in-process hook
for response status+duration, so RED is collected at nginx (the single entry point) rather than in-app
(see [ADR-0008](./DECISIONS.md#adr-0008)). nginx ships access logs over **syslog/UDP** to
`prometheus-nginxlog-exporter` (`monitoring/nginxlog-exporter/config.yml` + the `red` log_format in
`monitoring/nginx/00-red-logging.conf`, deployed to `/opt/chtivo/nginx/conf.d/`). Metrics:
`nginx_http_response_count_total{vhost,method,status}` (rate/errors) +
`nginx_http_response_time_seconds{...,quantile}` (latency, a **summary** p50/p90/p99). No app code
change, no app redeploy. **Op note:** editing `prometheus.yml` requires a container *recreate*
(`docker compose … up -d --force-recreate prometheus`), not a file-replace — the single-file bind mount
pins to the original inode, so a `tar`/replace is invisible until recreate.

**RUM / Core Web Vitals (Phase 3) — in-app:** unlike RED, RUM *is* in-app — the browser collects
CWV and beacons them. `web-vitals` is dynamically imported after hydration (deferred chunk, no LCP
impact) in `components/common/WebVitals`, beaconing to `POST /api/vitals` → `prom-client` histograms
(`web_vitals_{lcp,inp,cls,fcp,ttfb}`, `device` label from UA) in `src/lib/metrics.ts`, exposed at
`GET /metrics` (also `nodejs_*` process metrics). Prometheus scrapes `app:3000` **internally**; the
public `/metrics` is blocked at nginx (`location = /metrics { return 404; }` in the storefront server)
so internal metrics aren't exposed. CWV dashboard shows p75 by device. Deployed via CI (app code →
image → promote). Pinned `prom-client` + `web-vitals`.

**Coverage gate (CI):** new untested code trips the line-coverage ratchet (`vitest.config.ts`
thresholds). Phase 3 needed a unit test for `/api/vitals` to clear it — budget a small test for any
app code added in future phases.

**Dashboards & home page:** four dashboards — three focused per-pillar (`infra-use`, `app-red`,
`web-vitals`) plus a **consolidated** `observability` board (rows: Infra/USE · App/RED · Core Web
Vitals) that serves as the **home page**. The "Welcome to Grafana" banner is replaced by setting the
consolidated board as the org home dashboard, and the blog/news feed is off (`GF_NEWS_NEWS_FEED_ENABLED=false`).
Note: `GF_USERS_DEFAULT_HOME_DASHBOARD_PATH` is **not honored in Grafana 11.3**, so the home dashboard
is set via the org-preference API (persists in the `grafana_data` volume). To re-apply after a volume
reset:
```
docker run --rm --network chtivo_default curlimages/curl -s -X PUT -u admin:$GF_PW \
  -H 'Content-Type: application/json' -d '{"homeDashboardUID":"observability"}' \
  http://grafana:3000/api/org/preferences
```

## For developers & agents

- **Implementation status / phases:** [docs/plans/monitoring-observability.md](../plans/monitoring-observability.md)
- **Why each choice was made:** [DECISIONS.md](./DECISIONS.md) (ADR log)
- Once built: compose at `monitoring/`, dashboards-as-JSON at `monitoring/grafana/dashboards/`,
  alert/recording rules at `monitoring/prometheus/rules/`, runbook in this directory.
- Related: [docs/perf/](../perf/) (the perf/PSI work this monitors), [docs/deployment/](../deployment/).
