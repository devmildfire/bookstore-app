# Infra Image Update Automation — Design Plan

**Status:** proposed (design only — nothing implemented) · **Created:** 2026-07-19
**Related:** [dependency-monitoring.md](dependency-monitoring.md) (Renovate/Trivy — the *detection* half),
[../deployment/infra-sync.md](../deployment/infra-sync.md) (manual sync protocol),
[../deployment/supabase-production-bootstrap.md](../deployment/supabase-production-bootstrap.md) (restore),
[deploy/production/docker-compose.yml](../../deploy/production/docker-compose.yml).

---

## 0. The problem

Renovate now *detects* image updates (npm, base images, compose tags) and opens PRs. But merging a
PR only changes git; applying it to the VPS is a manual, **untested** step. Unlike the app image —
which has CI (unit + integration + e2e) proving it works before it ships — **third-party infra images
have no inherent tests.** A `kong` or `nginx` bump can pass Renovate, merge green, and still break the
running service in a way nothing catches until users do.

We want a **safe, mostly-automated** apply path: bring up the new image, prove it healthy and
load-ready, cut traffic over, keep the old one warm, and roll back automatically on failure — with an
alert + triage doc for the human. This is **blue-green / canary deployment**; we adopt the standard
pattern and standard tooling rather than inventing our own.

### The governing principle

> **No automated bump without an authored test.** The switching machinery is the easy 20%. The 80% is
> the per-service smoke/load test that makes "is the new container actually OK?" a machine-answerable
> question. Build the tests first; they're valuable even when a human presses go.

---

## 1. Image taxonomy — four classes, not "stateless vs impossible"

The critical refinement over the old binary framing: **statefulness of the *container* ≠ statefulness
of the *data*, and boot-time DB migrations are a third, separate axis.**

| Class | Services here | Container state | Blue-green the container? | The real constraint |
|---|---|---|---|---|
| **A. Stateless behind nginx** | app, kong, postgrest, postgres-meta | none | ✅ yes — the sweet spot | none beyond behavioral regressions → smoke test |
| **B. Ingress fabric** | nginx, cloudflared | none | ⚠️ special — *they are the switch* | cloudflared: run 2nd tunnel replica, drain old. nginx: `-t`+reload, or repoint cloudflared |
| **C. Stateless + boot migrations** | **gotrue (auth), storage-api** | none (container) | ✅ yes *if* the migration is backward-compatible | forward-only migrations against **shared** Postgres → two versions can't co-run if the schema changed |
| **D. True stateful singleton** | **postgres (db)** | **owns the data dir** | 🚫 no — a bump is a *migration event*, not a swap | on-disk format (major); binary compat (minor) |

**This means `gotrue` and `storage-api` are class C, not "impossible."** Their container swaps like any
stateless service; the only hazard is the schema migration they run on startup. Only **Postgres** is
class D. The object *data* storage-api serves is a local docker volume with no replica — but data is
**inert** (you back it up, you never "upgrade" it), so it isn't part of an *image* bump at all.

---

## 2. How each class is upgraded "the right way" (industry standard)

### Class A — stateless behind a reverse proxy
**Method: blue-green with a proxy cutover.** Textbook. Run new version as a second instance, health +
smoke check it, flip the proxy upstream, drain and stop the old. Zero downtime. This is what every load
balancer + rolling deploy does. Rollback = flip the upstream back (old kept warm during a bake window).

### Class B — ingress fabric
- **cloudflared:** Cloudflare Tunnel natively supports **multiple replicas of one tunnel** — start a
  new-version `cloudflared` replica; it registers to the same tunnel; Cloudflare load-balances; drain
  and stop the old. Built-in blue-green, no downtime. (This is Cloudflare's documented HA model.)
- **nginx:** it *is* the proxy doing Class-A cutovers, so it can't proxy-cutover itself. Two options:
  (1) `nginx -t && nginx -s reload` — zero-downtime config reload, but *same binary* (fine for config,
  not an image bump); (2) for an image bump, run new nginx on an alt port and repoint cloudflared to
  it, then retire old. Low frequency → a careful manual runbook is the pragmatic "right way."

### Class C — stateless service that runs boot migrations (gotrue, storage-api)
This is one of the most common patterns in all of web infra (it's how most apps deploy), and the
industry-standard solution is **expand/contract (a.k.a. parallel-change) migrations**:

1. **Expand** — the new version's migration is written to be **backward-compatible**: additive only
   (new nullable columns, new tables), never renaming/dropping what the old version reads. Now *both*
   old and new code work against the migrated schema.
2. **Deploy** new version alongside old (blue-green) — safe, because the schema serves both.
3. **Contract** — a *later* release removes the now-unused old columns, once no old code runs.

With expand-contract, gotrue/storage-api blue-green exactly like Class A. **Without** it (a
migration that's destructive or incompatible), you cannot run old+new simultaneously → you need a
**brief maintenance window**: stop old, run migration, start new (seconds–minutes). The right way to
*know which case you're in* is a **migration-compatibility test in CI** (see Phase 0) — apply the
candidate image's migration to a copy of prod schema and assert the old version still serves.

> Reality check for us: gotrue/storage-api migrations are upstream (Supabase's), forward-only, and
> mostly additive — usually expand-compatible, but **not guaranteed per release**. So the test gates it.

### Class D — Postgres, the genuinely hard one
Postgres versioning has two axes, with completely different upgrade methods:

**Minor upgrades** (`17.6 → 17.7`, or Supabase's `17.6.1.106 → 17.6.1.x`): **on-disk format is
identical.** The right way is trivial — **swap the image and restart.** Minutes of downtime at most.
The only diligence: read the minor release notes, take a backup first. *Most of our "frozen" Postgres
bumps are actually minors and low-risk — the freeze is caution, not technical impossibility.*

**Major upgrades** (`17 → 18`): on-disk format changes; you cannot just start v18 on a v17 data dir.
Three battle-tested methods, in ascending order of "less downtime, more complexity":

1. **Dump & restore** (`pg_dumpall` → `psql`/`pg_restore`) — simplest, most robust, works between any
   versions. Downtime scales with DB size + needs ~2× space. Fine for small DBs. **This is essentially
   your existing bootstrap/restore path** — so it's already rehearsed.
2. **`pg_upgrade`** (in-place, `--link` mode) — the standard fast path. Needs *both* old and new
   binaries present; hard-links data files so it's fast (minutes) regardless of DB size. Downtime =
   stop old → pg_upgrade → start new. Caveat: extensions must exist for the new version; run
   `ANALYZE` after.
3. **Logical-replication cutover** — **this is literally blue-green for a database, and the "right way"
   at scale.** Stand up a *new-version* Postgres, make it a **logical replica** of the old
   (`CREATE PUBLICATION` on old / `CREATE SUBSCRIPTION` on new, or `pglogical`). The new DB catches up
   live while the old keeps serving. When synced: pause writes for a few seconds, repoint the app to
   the new DB, done. **Near-zero downtime.** Caveats: logical replication doesn't copy DDL or sequence
   state automatically (handle explicitly), and needs primary keys / replica identity on tables.
   - **Managed platforms automate exactly this**: AWS RDS **Blue/Green Deployments**, GCP Cloud SQL,
     and Supabase's own cloud upgrade all use logical replication under the hood to give a one-click
     "green" environment you validate then switch to. On a single self-hosted VPS you'd do it by hand.

**Recommendation for us:** never automate a Postgres *major*. Keep it a **rehearsed-restore runbook**
(method 1, which we already have) or a documented logical-replication cutover (method 3) for a
near-zero-downtime major. **Automate Postgres *minors*** through the Class-A/C harness with a mandatory
backup + restore-rehearsal gate. This is a meaningful win — it unfreezes the low-risk 90%.

---

## 3. Battle-tested tech — what we adopt, and what we deliberately don't build

| Need | Standard tool we adopt | Why not roll our own |
|---|---|---|
| Container health definition | Compose **`healthcheck`** + `depends_on: service_healthy` | Native, already used by db/auth/storage |
| Rolling update + start-first + auto-rollback | **Docker Swarm mode** `service update --update-order start-first --update-failure-action rollback --health-cmd …` | This *is* steps 1–5 built-in. Compose-file compatible. Considered as the Phase-2 engine vs a bespoke script |
| Traffic cutover (Class A) | **nginx upstream + `-s reload`** (already in the stack) | Zero-downtime reload is a solved problem |
| Ingress HA (Class B) | **cloudflared tunnel replicas** (Cloudflare-native) | Vendor-supported HA model |
| Smoke / load "ready under load" test | **k6** (grafana/k6) for load + **Playwright** (already in repo) for e2e smoke | k6 is the battle-tested lightweight load tool; reuse existing e2e |
| Health signal during bake | **Prometheus + Alertmanager + Grafana** (already deployed) + **blackbox-exporter** for synthetic probes | We already run this; add blackbox probes |
| Alerting + human-in-loop | **Alertmanager → Telegram** (already wired) | Reuse |
| Ephemeral test stack in CI | Compose in **GitHub Actions** (already how integration/e2e run) | Reuse the CI pattern |
| Postgres major upgrade | **`pg_upgrade`** / **logical replication** (Postgres-native) — RDS Blue/Green model | Never hand-roll DB upgrade logic |
| Migration-compat check | apply candidate migration to prod-schema copy, assert old version serves | Small bespoke test; unavoidable |

**Decision D-SWARM — RESOLVED: script blue-green on plain Compose; do NOT adopt Swarm.** Swarm mode
gives start-first + health-gated auto-rollback natively, but adopting it means **re-platforming a working
prod stack** (`container_name` unsupported, bind-mounts/fixed-ports/`depends_on` rework, secrets →
`docker secret`, overlay networks) — the exact disruptive infra change we avoid — and it **still can't
blue-green Class D** (Postgres). It's also a waning ecosystem (k8s won orchestration). For one VPS with
low-frequency bumps, a small switch script buys the same rollback at a fraction of the risk. If we ever
outgrow one host, the path is **k8s / a managed platform**, not Swarm. (Aside: **Kamal** — zero-downtime
Docker deploys with health-checked rollback on a plain VPS — is a strong fit for the **app image
specifically** and worth revisiting for that alone; it's an awkward fit for wrapping the whole
self-hosted-Supabase stack.)

---

## 4. The switch, concretely (Class A/C reference flow)

```
        cloudflared ──▶ nginx ──▶ upstream {  svc-blue (old, :vN)   }   ← serving
                                            {  svc-green (new, :vN+1) }  ← warming

1. PULL    docker compose pull svc-green            (green = same service def, new image, alt name/port)
2. START   docker compose up -d svc-green           (runs alongside blue; gets identical env by def)
3. GATE    a) wait healthcheck healthy
           b) run smoke test against svc-green directly (real code path, not just /health)
           c) [class C] migration-compat already proven in CI
4. SWITCH  rewrite nginx upstream blue→green; nginx -t && nginx -s reload   (zero-downtime)
5. BAKE    watch Prometheus (error rate, p95 latency, SLO rules) for N minutes; blue stays warm
6a. PASS   docker compose stop svc-blue; record success to an audit log; done
6b. FAIL   rewrite upstream green→blue; reload; stop green; fire Telegram; emit triage doc
```

**Env parity** ("all env variables passed") is free: svc-green is the *same compose service definition*
with a new image tag, so it inherits identical env/volumes/secrets by construction. A *missing* var is
therefore not the failure mode; a **new image interpreting the same config differently** is — which is
exactly what the smoke test in 3b exists to catch.

---

## 5. Rollback trigger & triage doc

**Rollback must be high-signal, not hair-trigger** (a flaky probe auto-rolling-back = thrashing). Gate
on: healthcheck fail **OR** smoke-test fail **OR** a sustained (not single-sample) breach of an
existing Prometheus SLO rule over the bake window. Keep blue warm the entire bake → rollback is a
proxy flip, seconds.

**Triage doc** (auto-generated to `docs/triage/<svc>-<ts>.md` + Telegram link on failure) captures:
- image diff (old ref → new ref, digests), and the Renovate PR link
- the failing gate (which check, expected vs actual)
- `docker compose logs svc-green` tail + `docker inspect` health history
- Prometheus deltas over the bake window (error rate, latency, per-panel)
- the exact rollback command that ran, and current stack state (`compose ps`)
- a checklist stub for the human: "reproduce locally / check upstream changelog / file issue"

---

## 6. Phased implementation

**Phase 0 — make infra images testable (COMMITTED next step; standalone-valuable even fully-manual).**

This is the agreed starting point: it needs no staging server, and it makes *today's* manual syncs
safer (it would have caught any behavioral break in this week's kong/nginx bumps). Three deliverables.

**0.1 — Health mechanism for every stateless service. ✅ DONE** (2026-07-19).

Reality check on first pass: **most services already had a healthcheck** — `docker compose ps` showed
`app auth db kong meta storage` all `(healthy)`. So the actual gap was small. Final matrix:

| Service | Health mechanism | Status |
|---|---|---|
| **app** (Next.js) | Dockerfile `HEALTHCHECK` → **`/api/health`** (dependency-free liveness; excluded from the proxy so a DB blip doesn't mark it unhealthy) | ✅ shipped — PR #45 |
| **nginx** | compose `healthcheck` → **`/healthz`** on the default_server (200 regardless of Host; everything else still 444) | ✅ shipped + **applied to prod** — PR #46/#38 |
| auth, db, storage, kong, meta | already had compose/image healthchecks | ✅ pre-existing |
| **postgrest (rest)** | ⚠ **distroless image — no shell/`wget`/`curl` → a docker `healthcheck` is impossible.** Correct mechanism = **external HTTP probe** of its admin `/ready` (enable with `PGRST_ADMIN_SERVER_PORT`), scraped by the monitoring stack (blackbox-exporter) / used as the blue-green gate | 📋 deferred to the monitoring-probe wiring (0.2/Phase 1) |
| **cloudflared** | ⚠ **distroless — same constraint.** Correct mechanism = external probe of `/ready` (enable with `--metrics 0.0.0.0:2000`), scraped by Prometheus. Applying it also needs a cloudflared recreate = an ingress window | 📋 deferred (bundle with a future cloudflared bump) |
| studio | private (SSH-tunnel only, not proxied); shows `(unhealthy)` pre-existing | out of scope — track separately |

**Key finding — distroless services can't self-healthcheck.** `postgrest` and `cloudflared` ship
distroless (no shell, no probe binary), so Docker's in-container `healthcheck` cannot run. Forcing one
(e.g. a custom wrapper image with a static busybox) would abandon the upstream tested image and add a
build step — not worth it. The industry-standard answer is **external probing**: enable the service's
own `/ready` endpoint (one-line config each, above) and probe it from **outside** — via the monitoring
stack's blackbox-exporter (continuous, alerts through the existing Alertmanager→Telegram path) and/or
the blue-green switch gate. That work lands in 0.2 / Phase 1, where a probe consumer actually exists —
enabling the endpoints now (with no consumer, needing recreates) would be premature drift.

**0.2 — Smoke harness. ✅ CORE DONE** (PR #48 — `scripts/smoke/smoke.mjs`).

A single **portable, zero-dependency** harness (Node 22 `fetch`, exit 0 iff all selected checks pass),
env-configured, reused across CI (0.3), the blue-green gate (Phase 1), and prod post-sync verify. It
asserts real behaviour, not `/health` liveness:

| Check | Assertion |
|---|---|
| app | `/api/health` → 200 `{status:ok}` |
| gotrue | `/auth/v1/health` → 200 (through kong) |
| postgrest | `/rest/v1/` → 200 (through kong) |
| postgrest-data | `GET /rest/v1/Titles?limit=1` with anon key → 200 array — **proves kong forwards the apikey** + a real RLS read |
| storage | `/storage/v1/status` → 200 (through kong) |
| kong | unrouted `/` → 404 (kong responding = gateway up) |
| nginx | internal `/healthz` → 200 (CI/internal; publicly covered transitively) |

Hitting a service *through kong* covers the gateway transitively. Distroless services (postgrest,
cloudflared — §0.1) are health-gated by exactly this external harness. Verified against live prod
(keyless subset passes; the app check correctly flags that prod's app image predates the `/api/health`
route — it needs an app deploy).

**0.3 — CI: test the candidate image before merge.** **D-CANDIDATE-STACK resolved: two tiers.** The
integration CI stack boots via `supabase start`, which uses the **Supabase CLI's** image versions — NOT
our pinned prod images — so it can't test a candidate prod image. Instead, split by what a service needs
to boot:

- **Tier 1 — standalone boot + probe (no DB). ✅ BUILT** (`scripts/smoke/candidate-boot.sh` +
  `.github/workflows/candidate-image-test.yml`). On a PR that bumps a Tier-1 service's image, boot the
  **candidate** with its **real prod config** and prove it starts + serves — catching config/startup
  incompatibility (the #1 risk; exactly the nginx-config class behind the #38 caution) before merge.
  Shipped services:
  - **nginx** — `nginx -t` against the real `app.conf`, then boot + `/healthz` 200.
  - **kong** — `kong config parse` (DB-less) against the real `kong.yml`, then boot + unrouted `/` → 404.
  The workflow diffs the compose to find which Tier-1 image changed and tests only that; verified
  locally to PASS known-good pins, SKIP unknown services, and FAIL a broken candidate. Monitoring
  images (grafana `/api/health`, prometheus `/-/ready`, …) are the natural next Tier-1 additions.
- **Tier 2 — candidate-in-stack + `smoke.mjs`** (DB-coupled: postgrest, gotrue, storage, postgres-meta):
  a dedicated CI compose boots seeded postgres + the candidate service, then `smoke.mjs --only <svc>`.
  Bigger build — deferred (Tier 1 covers the highest-value/cheapest cases first).

**0.4 — Migration-compat test (Class C — gotrue/storage-api)** — ephemeral in CI: start the **new**
image against a Postgres loaded with the current prod *schema*, let its boot migrations run, then start
the **old** image against the same DB and assert it still serves (proves the migration is
expand-compatible → safe to blue-green; red → needs a maintenance window).

**Phase 1 — one human-triggered blue-green switch (script on Compose).**
- Pick `app` or `kong` first. Implement the §4 flow as a script: pull → green → gate → switch → bake →
  stop/rollback → Telegram + triage doc. **Human runs it; rollback is automatic.**

**Phase 2 — generalize + evaluate Swarm.**
- Extend to the other Class-A/B services; add cloudflared replica cutover; evaluate Docker Swarm mode
  as the engine to replace the bespoke script.

**Phase 3 — the stateful ones, correctly.**
- **Postgres minors:** automate through the harness with mandatory backup + restore-rehearsal gate.
- **gotrue/storage-api:** promote to the Class-A path once the migration-compat test is trusted;
  fall back to a scripted maintenance window when a migration isn't expand-compatible.
- **Postgres majors:** **never automated** — a documented `pg_upgrade` **or** logical-replication
  cutover runbook, rehearsed in staging.

**Phase 4 (optional, last) — close the autonomous loop.**
- Only after Phase 1 smoke tests prove low-false-positive over real bumps: let the switch trigger on
  Renovate-merge for the *lowest-risk* classes. The expensive last mile; do it only when earned.

---

## 7. Hard fences (must be enforced in any tooling)

- 🚫 **Never** auto-bump a Postgres **major**. Never run two Postgres on one data dir.
- 🚫 **Never** touch storage *object data* — see the PRIME DIRECTIVE in [AGENTS.md](../../AGENTS.md).
  This plan upgrades the storage-api *server*, never the files.
- 🚫 **Never** switch without the old container warm for the full bake window.
- 🚫 No autonomous (Renovate-triggered) apply until Phase 4, and never for Class C/D.
- ✅ Always backup before a Class-C/D apply; always `nginx -t` before reload.

---

## 8. Decisions

**Resolved**

| # | Decision | Resolution |
|---|---|---|
| D-SWARM | Update engine | **Plain Compose + a switch script. No Swarm** — re-platform risk, doesn't fix Class D, waning ecosystem. Kamal noted for the app image only (§3). |
| D-STAGING | Where to rehearse Class-C/D | **No standing staging stack.** Ephemeral stack in CI for migration-compat + smoke (0.3/0.4); on-VPS throwaway-Postgres-from-backup for pg_upgrade rehearsal. Fits single-VPS / no-heavy-procedure. |
| D-ORDER | What's first | **Phase 0** — prerequisite + standalone-valuable, no staging server needed. |
| D-DOWNTIME | Postgres upgrade posture | **Accept short scheduled windows; reject method 3 (logical replication).** On one VPS, method 3 isn't even truly zero-downtime (write-pause + services repoint at cutover = seconds) and carries Supabase-specific hazards (pgsodium/vault key transfer, unreplicated sequences, realtime slots, split-brain fencing) for a benefit that only applies to *rare majors*. Documented as an escape hatch only if the business ever can't tolerate the seconds. |
| D-PGMINOR | Automate Postgres minors? | **Yes** — frequent (~2–4/yr) but *seconds* (in-place image swap + restart). Automate through the harness: backup → swap → restart → healthcheck → smoke, with **old-volume rollback**. |
| D-PGMAJOR | Method for Postgres majors | **Dump & restore onto a FRESH volume** (old volume left pristine = instant rollback). Rare (~every 2–4 yr), *minutes* of downtime. **Never automated** — a rehearsed runbook. Not `pg_upgrade` (painful with Supabase images), not logical replication (D-DOWNTIME). |

**Downtime budget** (the planned downtime this posture accepts): minors ≈ **seconds, ~2–4×/year** (batchable; prompt only for critical CVEs) + majors ≈ **minutes, once every ~2–4 years**. Postgres majors ship ~annually but each major is supported 5 years, so cadence is our choice, and the frozen image (D4) means nothing forces a bump. App graceful-degradation (cached catalog stays up; only checkout/auth pauses) makes the minor blips near-invisible.

**Still open**

| # | Decision | Options |
|---|---|---|
| D-SMOKE | Smoke/load tool | k6 (load) vs reuse Playwright (e2e smoke) vs plain curl gates. Lean: curl gates for 0.2, k6 only if "ready under *load*" proves necessary |
| D-TRIAGE | Where triage docs live | `docs/triage/` in-repo vs artifact store + Telegram link |
| D-DEGRADE | App graceful-degradation during DB blip | Serve cached/SSG catalog + friendly "checkout back shortly" vs hard errors. Orthogonal but amplifies the downtime posture |
