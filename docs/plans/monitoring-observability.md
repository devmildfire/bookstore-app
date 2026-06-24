# Monitoring & Observability — plan

**Status:** proposed (for review)
**Author/date:** 2026-06-23
**Related:** [docs/perf/psi-baseline.md](../perf/psi-baseline.md), [docs/perf/README.md](../perf/README.md),
the PSI batch tooling, [docs/deployment/](../deployment/)

---

## 1. Goals & framing

This project has **two** goals, and they pull in different directions — stating both keeps the
scope honest:

1. **Utility** — if a metric regresses (perf score, container RAM/CPU, error rate, DB health), we
   find out and can act, with history to diagnose.
2. **Showcase** — this is a portfolio piece ([[portfolio, not revenue]]). The monitoring is itself a
   deliverable: it must demonstrate fluency with **industry-standard observability** (Prometheus +
   Grafana, exporters, PromQL, SLOs/burn-rate alerting) **done to a senior standard**, not a
   cron-and-a-table utility that only the owner understands.

> A cron+Supabase+ntfy solution (see prior discussion) is strictly cheaper and would satisfy goal 1.
> It is **rejected** because it under-delivers goal 2 — and for a portfolio, "demonstrate I can
> operate production observability" is a real requirement, not gold-plating. The minimal solution is
> documented here only as the rejected alternative so the choice reads as deliberate.

**Non-goals:** distributed tracing across services (overkill for this app), log aggregation/Loki
(Phase-N maybe; not core), high-availability monitoring (single-node is fine and honest for the
scale), paid SaaS.

**The "done well" bar** (what separates a showcase from cargo-culting — every phase is judged
against this):
- Dashboards structured by named methods: **USE** (Utilization/Saturation/Errors) for resources,
  **RED** (Rate/Errors/Duration) for the app.
- Alerting on **SLOs with multi-window burn-rate**, not bare `CPU > 80%` thresholds.
- **Right-sizing made visible** — `mem_limit`s, capped retention, low-cardinality labels, and a
  README that explains *why* each choice. The visible reasoning is the skill signal.
- The public dashboard is **always live** — a broken/empty Grafana shown to a reviewer is worse than
  no monitoring at all.

---

## 2. Resource budget (measured 2026-06-23)

VPS: **3 vCPU · 8 GB RAM · 97 GB disk (70 GB free)**. Current: ~1.9 GB used, **~6 GB available**,
swap idle, CPU near-idle.

Existing stack ≈ 1.2 GB across containers (kong 319 / app 260 / studio 191 / storage 173 / db 114 /
meta 87 / rest+auth+nginx+cloudflared ~73).

Monitoring budget (hard `mem_limit`s in compose; expected usage lower):

| Component | `mem_limit` | Expected | Role |
|---|---|---|---|
| Prometheus | 512 MB | 150–300 MB | TSDB + scrape; retention capped 15d |
| Grafana | 256 MB | ~130 MB | dashboards (public read-only) |
| cAdvisor | 256 MB | ~150 MB | per-container USE metrics (main CPU user) |
| node-exporter | 64 MB | ~25 MB | host USE metrics |
| postgres-exporter | 128 MB | ~40 MB | Supabase DB metrics |
| Alertmanager | 64 MB | ~40 MB | routing → Telegram |
| Pushgateway | 64 MB | ~30 MB | receives the synthetic/PSI batch job |
| **Total cap** | **~1.35 GB** | **~0.6–0.75 GB** | |

Lands in ~12% of available RAM, ~half the existing container footprint. No swap risk → no
observer-effect. **Free RAM if wanted:** disabling `studio` in prod (191 MB) more than covers
node+pg+alertmanager. Disk: capped retention keeps Prometheus to a few GB against 70 GB free.

---

## 3. Architecture

Three pillars + synthetic, all self-hosted in the existing compose, all on an internal Docker
network. Only Grafana is exposed (read-only) via the Cloudflare tunnel.

```
                         ┌─────────────── VPS (docker-compose, pinned versions) ───────────────┐
  Browser (real users)   │                                                                      │
   web-vitals beacon ───────▶ Next app  ── /metrics (prom-client) ──┐  RED + RUM (CWV)          │
                         │                                          │                           │
   cAdvisor ── per-container USE ───────────────────────────────┐  │                           │
   node-exporter ── host USE ────────────────────────────────┐  │  │                           │
   postgres-exporter ── DB metrics ───────────────────────┐  │  │  │                           │
                         │                                 ▼  ▼  ▼  ▼                           │
   PSI synthetic cron (systemd timer) ──push──▶ Pushgateway ─▶  Prometheus ──▶ Alertmanager ──▶ Telegram
                         │                                        │                             │
                         │                                     Grafana  ◀── PromQL              │
                         └───────────────────────────────────────┬──────────────────────────────┘
                                                                  │ grafana.<domain> (CF tunnel, anonymous Viewer)
                                                            Portfolio visitors (read-only dashboards)
```

**Pillar 1 — Infra (USE):** `cAdvisor` (per-container CPU/mem/net/disk — every chtivo container by
name) + `node-exporter` (host) + `postgres-exporter` (Supabase Postgres: connections, tx, cache hit
ratio, locks).

**Pillar 2 — App (RED):** `prom-client` in the Next app exposes `/metrics` — request **R**ate,
**E**rror rate (by status class), request **D**uration histogram. Instrumented in `proxy.ts` (runs
on every request) or a thin wrapper; `/metrics` served by an internal route, scraped on the internal
network only (never exposed publicly).

**Pillar 3 — RUM (Core Web Vitals):** `web-vitals` lib in the browser → `navigator.sendBeacon`
→ `POST /api/vitals` → recorded into `prom-client` histograms (`web_vitals_lcp_seconds`,
`_inp_`, `_cls_`) with **low-cardinality** labels (`page_type`, `device` — never URL or user).
Grafana shows **p75** via `histogram_quantile(0.75, …)` — exactly how CWV are defined. Works because
the app is a persistent container (not serverless). *Grafana Faro (richer frontend RUM: JS errors +
sessions + traces) was considered and **rejected** as overkill for a low-traffic portfolio — adds
client JS to a perf-focused site + 2–3 services; see [ADR-0007](../monitoring/DECISIONS.md#adr-0007).*

**Synthetic — lab PSI:** the existing PSI batch script runs as a **VPS systemd timer** (daily),
samples ~8 cache-busted mobile runs, takes the **median** (never a single run — that's the tail-noise
trap documented in psi-baseline.md), and pushes to **Pushgateway** (the textbook tool for periodic
batch-job metrics). Prometheus scrapes Pushgateway → Grafana trends perf/LCP/CLS over weeks; an alert
fires if the median crosses a threshold. *Runs on the VPS (not GitHub Actions) so Pushgateway stays
internal and the service-account key never needs an exposed endpoint.*

---

## 4. Dashboards (Grafana)

1. **Overview** — single-pane health: app up/down, request rate, error rate, p95 latency, p75 LCP,
   key container memory, DB connections. The "is everything OK?" screen.
2. **Infra / USE** — per-container CPU/mem/net/disk (table + timeseries), host CPU/load/mem/disk,
   saturation (swap, throttling).
3. **App / RED** — request rate by route-class, error rate by status, latency p50/p95/p99.
4. **Core Web Vitals** — p75 LCP/INP/CLS over time (with the "good" threshold lines), split by
   device; field data that works at any traffic (unlike CrUX).
5. **Synthetic (PSI)** — lab perf score + LCP/FCP/CLS median trend; annotated with deploy markers.
6. **Database** — connections, cache hit ratio, tx rate, slow-query/lock indicators.

All dashboards version-controlled as JSON in `monitoring/grafana/dashboards/` and provisioned on
startup (no click-ops; reproducible — itself a skill signal).

---

## 5. Alerting (SLOs + burn-rate)

Defined as Prometheus recording + alerting rules (version-controlled), routed by Alertmanager →
**Telegram** (decision pending — see §9).

**SLOs (starting targets, tune after baseline):**
| SLO | Target | Source |
|---|---|---|
| Availability | 99.5% (app responds 2xx/3xx) | synthetic uptime / RED |
| Latency | p95 request duration < 500 ms | RED |
| Error rate | 5xx < 1% of requests | RED |
| Field LCP | p75 LCP < 2.5 s | RUM |

**Alert style:** multi-window **burn-rate** on the error & latency SLOs (fast 1 h + slow 6 h windows
→ page only on sustained burn, not a blip). Plus simple infra guards (host disk > 85%, container at
mem_limit, container restart loop). The burn-rate alerting is the strongest senior signal in the
whole project.

---

## 6. Deployment & security

- **Self-hosted** in a `monitoring/docker-compose.yml` (or a profile in the main compose), joined to
  the chtivo internal network so exporters/app `/metrics` are reachable internally only.
- **Exposure:** only `grafana.<domain>` via the Cloudflare tunnel, **anonymous org access = Viewer**
  (read-only) so portfolio visitors see dashboards without login; the Grafana admin account stays
  password-protected and is not the public role. Prometheus, Pushgateway, Alertmanager, and all
  exporters are **never** exposed.
- **Secrets** (PSI service-account key, Telegram bot token, Grafana admin password) in root-only env
  files on the VPS, **never committed** (historical .env-leak rule applies).
- **Pinned image versions** for every monitoring container (matches the repo's exact-pin policy).
- **Cardinality & label hygiene:** no URLs/user-ids/high-cardinality labels; no internal hostnames or
  secrets leaked into labels that surface on the public dashboard.
- **Cost: $0 incremental** — existing VPS headroom, free GitHub, free CF tunnel.

---

## 7. Phased implementation (each phase shippable & reviewable)

| Phase | Deliverable | Acceptance |
|---|---|---|
| **0 — Foundation** | `monitoring/` compose: Prometheus + Grafana, internal net, mem_limits, 15d retention; Grafana exposed read-only via tunnel; provisioning scaffold | Grafana loads publicly read-only; Prometheus `/targets` healthy |
| **1 — Infra/USE** | cAdvisor + node-exporter + postgres-exporter; USE + Database dashboards | All chtivo containers + host + DB visible with CPU/mem/disk |
| **2 — App/RED** | `prom-client` in Next, internal `/metrics`, RED dashboard | Live traffic shows rate/error/latency; p95 panel populated |
| **3 — RUM/CWV** | `web-vitals` + `/api/vitals` + histograms; Core Web Vitals dashboard | Real visits produce p75 LCP/INP/CLS |
| **4 — Synthetic** | PSI systemd timer → Pushgateway → Prometheus; Synthetic dashboard | Daily PSI median points trend over time |
| **5 — Alerting/SLOs** | Alertmanager + recording/alerting rules + burn-rate; Telegram routing | A forced SLO breach pages; alert resolves on recovery |
| **6 — Documentation** | `docs/monitoring/README.md`: architecture diagram, three-pillars narrative, dashboard screenshots, runbook, "why these choices" | A reviewer understands & could operate the stack from the README alone |

Phases 0–6 are the complete scope. Phases 0–1 deliver visible value immediately (infra dashboard);
5 and 6 are where the *showcase* value concentrates — do not skip them; SLO alerting + documentation
are the senior differentiators. (Grafana Faro was considered for a frontend-RUM Phase 7 and rejected
as overkill — [ADR-0007](../monitoring/DECISIONS.md#adr-0007).)

---

## 8. Risks & honest ceilings

- **The real cost is maintenance attention, not RAM.** A rotted/empty public dashboard showcases the
  opposite of competence. Committing to this = committing to keeping it live + the README current.
- **cAdvisor** is the main CPU/mem user of the additions; tune housekeeping interval / drop unused
  metrics if it ever matters (it won't at this scale).
- **Public Grafana = attack surface.** Mitigated by read-only anon, pinned versions, no sensitive
  labels, nothing but Grafana exposed.
- **`docker stats`-class point-in-time gaps don't apply** here (Prometheus scrapes continuously) —
  this is the upgrade from the rejected cron approach.
- **Single-node, no HA** — deliberate and honest for the scale; documented as a conscious choice.

---

## 9. Decisions — all resolved (2026-06-24)

Every question is settled; full rationale in the [ADR log](../monitoring/DECISIONS.md). Ready for
Phase 0.

| # | Question | Resolution | Record |
|---|---|---|---|
| 1 | Alert channel | **Telegram** | [ADR-0005](../monitoring/DECISIONS.md#adr-0005) |
| 2 | Grafana public? | **Yes — read-only anonymous** | [ADR-0006](../monitoring/DECISIONS.md#adr-0006) |
| 3 | PSI cron location | **VPS systemd timer → internal Pushgateway** | [ADR-0003](../monitoring/DECISIONS.md#adr-0003) |
| 4 | Grafana Faro? | **Rejected** (overkill) | [ADR-0007](../monitoring/DECISIONS.md#adr-0007) |
| 5 | Disable `studio`? | **No — keep it** (RAM headroom is fine; useful for DB admin) | — |
| 6 | Self-host vs Grafana Cloud | **Self-host** | [ADR-0002](../monitoring/DECISIONS.md#adr-0002) |
