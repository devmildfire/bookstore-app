# Architecture Decision Records — Monitoring

[Architecture Decision Records](https://adr.github.io/) capture *significant* decisions with their
context and rationale, so future devs and agents understand **why** the system is the way it is — not
just what it is. Each record is immutable once Accepted; a reversal is a *new* record that supersedes
it. Scope: the observability stack ([README](./README.md), [plan](../plans/monitoring-observability.md)).

| ADR | Decision | Status |
|---|---|---|
| [0001](#adr-0001) | Industry stack (Prometheus + Grafana) over a cron + Supabase utility | Accepted |
| [0002](#adr-0002) | Self-host the stack rather than Grafana Cloud | Accepted |
| [0003](#adr-0003) | PSI synthetic runs on the VPS → internal Pushgateway | Accepted |
| [0004](#adr-0004) | Structure observability as three pillars + synthetic (USE/RED/CWV) | Accepted |
| [0005](#adr-0005) | Alert on SLO multi-window burn-rate, not static thresholds | Accepted |
| [0006](#adr-0006) | Expose only Grafana, anonymous read-only | Accepted |
| [0007](#adr-0007) | Core Web Vitals via `prom-client` histogram; Grafana Faro rejected as overkill | Accepted |
| [0008](#adr-0008) | App RED measured at the nginx ingress (log exporter), not in-app prom-client | Accepted |

---

## ADR-0001
### Use an industry stack (Prometheus + Grafana) rather than a cron + Supabase utility
**Status:** Accepted · 2026-06-23

**Context.** This is a portfolio project ([portfolio, not revenue]). Monitoring serves two goals:
real utility *and* demonstrating production-observability skill to reviewers. A minimal solution —
a scheduled job storing PSI + `docker stats` rows in Supabase, alerting via ntfy — would fully cover
the utility goal at near-zero cost/maintenance.

**Decision.** Build the industry-standard stack (Prometheus, Grafana, exporters, Alertmanager).

**Rationale.** For a portfolio, "demonstrate I can operate production observability" is a real
requirement, not gold-plating. The minimal solution under-delivers the *showcase* deliverable even
though it satisfies utility. The VPS has the headroom (ADR-0002), so the trade is maintenance
attention, not resources.

**Alternatives considered.** *Cron + Supabase + ntfy* — rejected: utilitarian, only legible to its
author, signals nothing about industry tooling. *Paid SaaS (Datadog/New Relic)* — rejected: cost,
and "I can pay for a tool" is a weaker signal than "I can run the stack."

**Consequences.** Higher build + upkeep effort; the stack must stay *live and documented* or it
showcases the opposite of competence. The rejected cron approach is preserved as the synthetic pillar
(ADR-0003/0004), so its value isn't lost.

---

## ADR-0002
### Self-host the stack on the existing VPS rather than Grafana Cloud
**Status:** Accepted · 2026-06-24

**Context.** Collection + dashboards can run self-hosted (compose on the VPS) or be pushed to Grafana
Cloud's free tier via Alloy `remote_write`. VPS measured at 3 vCPU / 8 GB / ~6 GB free; the stack
budgets ~0.6–0.75 GB.

**Decision.** Self-host everything in the existing docker-compose.

**Rationale.** For a showcase, *operating* the stack (compose orchestration, exporter wiring, PromQL,
alert rules, secure exposure) is a stronger signal than pointing an agent at a SaaS. Resource cost is
comfortable (~12% of available RAM, no swap → no observer-effect). Cost stays $0.

**Alternatives considered.** *Grafana Cloud free tier + Alloy* — always-up, less maintenance, public
dashboards built-in, but shows less "I ran it" and adds a third-party dependency.

**Consequences.** We own uptime, patching, and securing the public Grafana (ADR-0006). Versions are
pinned; retention and `mem_limit`s are capped so a mistake can't starve the app.

---

## ADR-0003
### Run the PSI synthetic check on the VPS, pushing to an internal Pushgateway
**Status:** Accepted · 2026-06-24

**Context.** A daily PSI sample (median of ~8 cache-busted runs — never a single run; see
[psi-baseline.md](../perf/psi-baseline.md)) feeds the synthetic pillar. It could run on GitHub
Actions (free, off-box) or as a VPS systemd timer.

**Decision.** Run it as a VPS systemd timer that pushes results to an **internal** Pushgateway, which
Prometheus scrapes.

**Rationale.** Pushgateway is the canonical sink for periodic *batch-job* metrics. Keeping the job and
the gateway on the VPS means the gateway is never exposed and the PSI service-account key never needs
a public endpoint. Reuses the existing `psi-batch.mjs` tooling.

**Alternatives considered.** *GitHub Actions cron* — keeps the key off the prod box, but then
Pushgateway must be publicly reachable (attack surface) or results must route through Supabase
(breaks the single-Prometheus story).

**Consequences.** The PSI key lives in a root-only env file on the VPS (never committed). One more
systemd unit to maintain.

---

## ADR-0004
### Structure observability as three pillars + synthetic, by USE/RED/CWV
**Status:** Accepted · 2026-06-23

**Context.** Metrics need an organizing principle, or dashboards become an unstructured pile.

**Decision.** Four vantage points: **Infra/USE** (resources), **App/RED** (service), **RUM/CWV** (real
users), **Synthetic** (scheduled probe). Dashboards and alerts are organized by these methods.

**Rationale.** USE (Gregg) + RED (Wilkie) are the recognized methods for resources and services
respectively, both rooted in Google SRE's Four Golden Signals; CWV is Google's real-user standard.
Using the named methods makes the design legible to any reviewer and gives **triangulation** — a fault
appears in some pillars and not others, which locates it (demonstrated by the 2026-06-23 PSI scare:
three pillars green + synthetic-only drop = measurement artifact, not regression).

**Alternatives considered.** *Ad-hoc dashboards* — rejected: no shared vocabulary, harder to reason
about, weaker signal.

**Consequences.** Requires app instrumentation (`prom-client` for RED, `/api/vitals` for RUM), not
just infra exporters. CrUX is *not* used for RUM (insufficient traffic) — self-collected web-vitals
instead.

---

## ADR-0005
### Alert on SLO multi-window burn-rate, not static thresholds
**Status:** Accepted · 2026-06-23

**Context.** Alerting can be naive (`error rate > 1% → page`) or SLO-based.

**Decision.** Define SLIs → SLOs → error budgets for user-experience metrics, and alert on
**multi-window burn-rate** (fast 1 h + slow 6 h must both burn). Binary infra catastrophes (disk > 85%,
OOM/restart-loop, host down) keep plain threshold guards. Alertmanager handles grouping, inhibition,
silencing, routing.

**Rationale.** Static thresholds both over-page (a 2-min blip wakes you) and under-page (a steady
sub-threshold burn silently exhausts the budget). Burn-rate scales alert severity to budget-impact;
multi-window kills false pages. This is the Google SRE workbook pattern and the strongest senior
signal in the project. Thresholds remain correct for binary "fix-now" infra conditions.

**Alternatives considered.** *Static thresholds everywhere* — rejected for experience metrics (above).
*No alerting, dashboards only* — rejected: defeats the utility goal.

**Consequences.** Requires recording rules + an error-budget model; SLO targets are initial guesses to
tune after a baseline. Alert channel: **Telegram** (free, rich formatting, simple bot, pairs cleanly
with Alertmanager).

---

## ADR-0006
### Expose only Grafana, anonymous read-only
**Status:** Accepted · 2026-06-24

**Context.** The dashboards are part of the showcase, so reviewers should see them without an account.
Prometheus has no auth by default; exporters leak internal structure.

**Decision.** Expose only `grafana.<domain>` via the CF tunnel with anonymous org role = **Viewer**
(read-only). Admin stays password-protected. Prometheus, Alertmanager, Pushgateway, exporters remain
internal-only.

**Rationale.** Grafana is the only component with proper auth and a safe read-only public mode. Public
dashboards realize the showcase value with minimal surface.

**Alternatives considered.** *Private (auth-gated) Grafana* — safer but reviewers can't see it without
credentials, losing showcase value. *Expose Prometheus too* — rejected: no auth, leaks internals.

**Consequences.** A public dashboard is an attack surface: mitigate with read-only anon, pinned +
patched Grafana, **no sensitive labels** (URLs/user-ids/hostnames), optional CF rate-limiting.

---

## ADR-0007
### Core Web Vitals via `prom-client` histogram; Grafana Faro rejected
**Status:** Accepted · 2026-06-24

**Context.** RUM can be collected with a `web-vitals` beacon into a `prom-client` histogram, or with
Grafana Faro (richer: JS errors, sessions, traces) which needs a Grafana Alloy receiver + Loki/Tempo.

**Decision.** Collect Core Web Vitals with `web-vitals` → `prom-client` histogram (Phase 3), p75 via
`histogram_quantile`. **Faro is rejected** — not deferred — for this project.

**Rationale.** The histogram covers the CWV showcase fully with **zero added client JS and zero extra
components**, and demonstrates histogram/PromQL fluency. Faro's extra detail (per-session, frontend
errors, traces) is real but **overkill for a low-traffic portfolio**: it adds tens of KB of client JS
to a site whose whole story is performance (the tool degrading the metric it measures), plus 2–3 more
services (Alloy/Loki/Tempo) for telemetry that's sparse without volume. The goal is a **strong, clear,
unambiguous competence signal — and right-sizing (knowing what to leave out) *is* that signal**;
bolting on unused depth would read as the opposite.

**Alternatives considered.** *Grafana Faro* — rejected (above): richness this scale doesn't need, at a
cost that dilutes the performance story. *No RUM (CrUX only)* — rejected: insufficient traffic for CrUX.

**Consequences.** RUM is aggregate-only (p75 trends, no per-session/error drill-down) — intentional and
acceptable. Frontend error tracking is out of scope; if ever genuinely needed it would be a separate,
explicitly-justified change, not part of this stack. Works because the Next app is a persistent
container (not serverless).

---

## ADR-0008
### App RED measured at the nginx ingress (log exporter), not in-app prom-client
**Status:** Accepted · 2026-06-24

**Context.** Phase 2 needs App RED (request **R**ate, **E**rrors, **D**uration). The plan assumed
`prom-client` inside Next. But Next's App Router has **no clean in-process hook that sees a request's
final status + duration**: middleware (`proxy.ts`) runs *before* the response, so it can count
requests but can't observe errors or latency. True in-app RED would require a custom server or
OpenTelemetry-metrics wiring.

**Decision.** Measure RED at the **nginx ingress** — the single entry point all traffic already flows
through — with `prometheus-nginxlog-exporter`. nginx ships each access line over syslog/UDP (a `red`
log_format) → exporter → Prometheus (`nginx_http_response_count_total{vhost,method,status}` +
`nginx_http_response_time_seconds{...,quantile}`).

**Rationale.** Complete RED (rate/errors/latency, per vhost) with **no app code change and no app
redeploy** — lowest risk to the live storefront — and it measures what's actually served. In-app
OTel/custom-server would add deps + a redeploy + fiddlier setup for no better data on a single-ingress
app. The exporter runs over syslog (no shared volume, no nginx recreate — just a reload).

**Alternatives considered.** *In-app `prom-client`* — cleanly yields only Rate (middleware); errors +
duration need a custom server. *In-app OpenTelemetry metrics* — first-class but deps + redeploy +
fiddlier. *nginx `stub_status` exporter* — rate/connections only, no per-status or latency.

**Consequences.** RED reflects served HTTP at the ingress (includes static/404s/all vhosts; filter by
`vhost` for the storefront), not app-internal route timings. Latency is exposed as a **summary**
(p50/p90/p99), not a histogram — fine for this single nginx instance (can't aggregate quantiles across
instances, which doesn't apply here). Operational note: a `prometheus.yml` change needs a **container
recreate**, not a file-replace — the single-file bind mount pins to the original inode.
