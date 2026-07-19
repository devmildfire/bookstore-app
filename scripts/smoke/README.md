# Infra smoke tests

`smoke.mjs` asserts each infra service's **real behaviour** (not just that a process is up) —
a real anon row read through PostgREST, gotrue's `/auth/v1/health`, kong actually routing, etc.

It's the reusable gate from [docs/plans/infra-image-automation.md](../../docs/plans/infra-image-automation.md).
The **same** harness is meant to run in three places:

1. **CI (Phase 0.3)** — against an ephemeral stack with a *candidate* infra image, so a Renovate
   image bump gets an "inherent test" before it can merge.
2. **Blue-green switch gate (Phase 1)** — against the freshly-started `-green` container before
   traffic is cut over; a failure auto-rolls-back.
3. **Prod post-sync verify** — after a manual infra sync ([infra-sync.md](../../docs/deployment/infra-sync.md)).

Portable by design: Node 22 global `fetch`, **zero dependencies**, exit code `0` iff every selected,
runnable check passed.

## Usage

```bash
node scripts/smoke/smoke.mjs --list                    # show all checks
node scripts/smoke/smoke.mjs                           # run all, current env
node scripts/smoke/smoke.mjs --only app,gotrue         # subset (e.g. one swapped service)
node scripts/smoke/smoke.mjs --strict                  # skips count as failures (CI)
```

## Config (env)

| Var | Enables |
|---|---|
| `SMOKE_APP_URL` | `app` check (`/api/health`) |
| `SMOKE_API_URL` | `gotrue`, `postgrest`, `storage`, `kong` (all through the gateway) |
| `SUPABASE_ANON_KEY` | `postgrest-data` (real anon row read — proves kong forwards the apikey) |
| `SMOKE_NGINX_URL` | `nginx` `/healthz` (internal/CI only; publicly nginx is covered transitively) |

A check whose config is absent is **skipped** (reported, not failed) — so pointing it at prod without
keys runs the keyless subset. `--strict` turns skips into failures for CI, where all config exists.

## Notes

- Hitting a service **through kong** (`SMOKE_API_URL`) also proves kong routed it and preserved the
  apikey header — the gateway is covered transitively, no separate probe needed.
- The **distroless services** (postgrest, cloudflared) can't self-healthcheck (§0.1); this external
  harness is exactly how they get health-gated.
- Example (prod, keyless): `SMOKE_APP_URL=https://bookstore-app.mildfire.dev SMOKE_API_URL=https://api.mildfire.dev node scripts/smoke/smoke.mjs`
