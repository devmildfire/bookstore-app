# Plan: Move to an Organization + enable Merge Queue

**Status:** proposed (not scheduled) · **Created:** 2026-07-19
**Why:** GitHub's native **merge queue** is the correct "one-at-a-time, rebase-as-needed" merge
mechanism — but it is **organization-only**. `devmildfire/bookstore-app` is owned by a **personal
User account**, so merge queue is unavailable (the classic "Require merge queue" checkbox is absent and
the rulesets API rejects `Invalid rule 'merge_queue'`). The only way to get it is to move the repo
under an **Organization**. Until then, the dependency loop self-heals via the interim on-push rebase
(`renovate.yml` + `rebaseWhen: conflicted` — see [dependency-monitoring.md](dependency-monitoring.md)).

> Merge queue is free for **public** org repos; private org repos need GitHub Enterprise Cloud.
> Source: [Managing a merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue).

---

## Phase 1 — Create the organization
- Create a **Free** GitHub Organization (e.g. `chtivo` / `mildfire-dev`). Free is sufficient — public
  org repos get merge queue at no cost.
- Add your user as owner. No other members needed initially.

## Phase 2 — Transfer the repo (the disruptive part)
Transfer `bookstore-app` into the org, **keeping it public**. GitHub sets up redirects from the old
URL, but several things reference the old owner and must be fixed:

| What references `devmildfire/…` | Fix |
|---|---|
| **Local git remote** | `git remote set-url origin git@github.com:<org>/bookstore-app.git` |
| **GHCR image path** `ghcr.io/devmildfire/bookstore-app` | Appears in `ci.yml` (build/push), `deploy-production.yml`, `deploy/production/docker-compose.yml` (`APP_IMAGE`/pull), `trivy.yml` (scan targets). Rebuild/re-tag under `ghcr.io/<org>/…`, or keep pulling the old path until the first post-transfer build. |
| **Renovate** | `RENOVATE_REPOSITORIES` (renovate.yml env) → `<org>/bookstore-app`; confirm the `RENOVATE_TOKEN` PAT is authorized for the org repo. |
| **Deploy over SSH** | `deploy-production.yml` + any VPS scripts that hardcode the repo/owner; the `portfolio-vps` deploy user pulls `ghcr.io/<org>/…` — update `/opt/chtivo` compose via the infra-sync protocol. |
| **Secrets** | Repo-level Actions secrets (RENOVATE_TOKEN, TELEGRAM_*, GHCR creds, deploy key) **move with the repo**, but re-verify after transfer. Consider promoting shared ones to **org-level** secrets. |
| **Branch protection / rulesets** | Re-created on transfer? Verify the 7 required checks + `allow_update_branch` + `enforce_admins` survived; re-apply if not. |
| **Docs / links** | `AGENTS.md`, `docs/**`, memory notes referencing `devmildfire/bookstore-app`. |

⚠️ **Order:** do the transfer in a quiet window; the first CI run post-transfer rebuilds the image
under the new GHCR path — make sure prod keeps pulling a valid image until then (don't break the deploy).

## Phase 3 — Enable the merge queue
Once org-owned, either path works (org repos expose both):
- **Rulesets (recommended):** Settings → Rules → Rulesets → New branch ruleset targeting `main`, add
  the **Merge queue** rule (Squash; max-to-build 5; min-to-merge 1; wait 5m; timeout 60m; ALLGREEN) +
  a **Require status checks** rule with the 7 contexts. The API call that failed before will now be
  accepted (`gh api POST …/rulesets` with the `merge_queue` rule — schema was already correct).
- **Classic:** the "Require merge queue" checkbox will now appear on the branch-protection page.

**The checks-coupling gotcha (must get right):** required checks must run on **both** `pull_request`
(to enter the queue) *and* `merge_group` (to leave it), with **identical check names**. Already done —
`ci.yml` and `candidate-image-test.yml` carry the `merge_group` trigger (added 2026-07-19, PR #72).

## Phase 4 — Retire the interim rebase mechanism
Once the queue is live and verified processing PRs one-at-a-time:
- Remove the `on: push` Renovate trigger + `rebaseWhen: conflicted` (the queue owns rebasing).
- Renovate's auto-merge routes PRs into the queue automatically.

## Decision notes
- **Worth it if** you want org-level ownership anyway (teams, org policies, org secrets) — the queue
  comes free with that.
- **Not worth it just for the queue** — the interim on-push rebase already gives the practical
  behaviour (rebase conflicted PRs one-at-a-time, no CI storm) with none of the transfer risk.
- The heaviest risk is the **GHCR image-path migration** touching the live deploy — plan that carefully.
