#!/usr/bin/env bash
# Weekly dependency-loop health digest (renovate.yml `digest` job → Telegram). Prints the message.
# Exists because the loop once stalled for 12 weeks (2026-07→10) while every individual alert
# "worked": nothing watched the loop ITSELF. Each ⚠️ line is a stall signal, not an event.
# Usage: REPO=owner/name [RENOVATE_TOKEN=…] scripts/dependency-health.sh   (needs gh + jq)
set -euo pipefail
: "${REPO:?REPO unset}"
STALL_DAYS=14 PROD_LAG_DAYS=30 TOKEN_WARN_DAYS=30
now=$(date +%s)
age() { echo $(( (now - $(date -d "$1" +%s)) / 86400 )); }
warn=() info=()

# 1. Is the loop merging? (Renovate PRs are pushed by the PAT owner, so match the branch prefix.)
last=$(gh pr list --repo "$REPO" --state merged -L 100 --json headRefName,mergedAt \
  -q '[.[] | select(.headRefName | startswith("renovate/")) | .mergedAt] | max // empty')
if [ -z "$last" ]; then warn+=("No merged Renovate PR found in the last 100 merges")
elif [ "$(age "$last")" -gt $STALL_DAYS ]; then warn+=("Loop stalled: last Renovate merge $(age "$last")d ago")
else info+=("Last Renovate merge: $(age "$last")d ago"); fi

# 2. Stuck PRs: open renovate PRs, the oldest, and the ones with a failing check.
prs=$(gh pr list --repo "$REPO" --state open -L 100 --json number,title,headRefName,createdAt,statusCheckRollup \
  -q '[.[] | select(.headRefName | startswith("renovate/"))]')
n=$(jq length <<< "$prs")
if [ "$n" -gt 0 ]; then
  oldest=$(jq -r 'map(.createdAt) | min' <<< "$prs")
  line="Open Renovate PRs: $n (oldest $(age "$oldest")d)"
  if [ "$(age "$oldest")" -gt $STALL_DAYS ]; then warn+=("$line"); else info+=("$line"); fi
  while IFS= read -r f; do warn+=("Red: $f"); done < <(jq -r '.[]
    | select([.statusCheckRollup[]? | (.conclusion // .state)] | any(. == "FAILURE" or . == "ERROR"))
    | "#\(.number) \(.title)"' <<< "$prs")
fi

# 3. Waiting on you: majors / untested images parked for Dependency Dashboard approval.
pending=$(gh issue list --repo "$REPO" --state open --search 'Dependency Dashboard in:title' -L 1 --json body \
  -q '.[0].body // ""' | grep -c 'approve-branch=' || true)
[ "$pending" -gt 0 ] && info+=("Awaiting your approval on the Dependency Dashboard: $pending")

# 4. Production lag: merged updates only reach prod via a manual `git push origin main:production`.
ahead=$(gh api "repos/$REPO/compare/production...main" -q .ahead_by 2>/dev/null || echo '?')
pdate=$(gh api "repos/$REPO/commits/production" -q .commit.committer.date 2>/dev/null || true)
if [ -n "$pdate" ]; then
  line="Production: $ahead commits behind main, last promoted $(age "$pdate")d ago"
  if [ "$ahead" != 0 ] && [ "$(age "$pdate")" -gt $PROD_LAG_DAYS ]; then warn+=("$line"); else info+=("$line"); fi
fi

# 5. Open critical findings (Trivy → code scanning, Dependabot).
count() { # paginated API → summed count, or "?" if the token can't read it
  local out; out=$(gh api --paginate "$1" -q "$2" 2>/dev/null) || { echo '?'; return; }
  awk '{s+=$1} END {print s+0}' <<< "$out"
}
cs=$(count "repos/$REPO/code-scanning/alerts?state=open&per_page=100" \
  '[.[] | select(.rule.security_severity_level == "critical")] | length')
db=$(count "repos/$REPO/dependabot/alerts?state=open&severity=critical&per_page=100" 'length')
line="Open CRITICAL alerts: $cs code-scanning, $db Dependabot"
if [ "$cs" = 0 ] && [ "$db" = 0 ]; then info+=("$line")
elif [ "$cs" != '?' ] && [ "$cs" -gt 0 ] || { [ "$db" != '?' ] && [ "$db" -gt 0 ]; }; then warn+=("$line")
else info+=("$line (? = token can't read it)"); fi

# 6. RENOVATE_TOKEN expiry (fine-grained PATs expire; GitHub returns the date as a response header).
if [ -n "${RENOVATE_TOKEN:-}" ]; then
  exp=$(curl -fsSI -H "Authorization: Bearer $RENOVATE_TOKEN" https://api.github.com/rate_limit \
    | tr -d '\r' | sed -n 's/^github-authentication-token-expiration: //Ip')
  if [ -z "$exp" ]; then info+=("RENOVATE_TOKEN: no expiry")
  else
    left=$(( ($(date -d "$exp" +%s) - now) / 86400 ))
    if [ "$left" -lt $TOKEN_WARN_DAYS ]; then warn+=("RENOVATE_TOKEN expires in ${left}d — rotate it"); else info+=("RENOVATE_TOKEN: ${left}d left"); fi
  fi
fi

if [ ${#warn[@]} -gt 0 ]; then echo "⚠️ Dependency loop needs attention"; printf '• %s\n' "${warn[@]}"
else echo "✅ Dependency loop healthy"; fi
[ ${#info[@]} -gt 0 ] && printf '· %s\n' "${info[@]}"
echo "https://github.com/$REPO/issues?q=is%3Aopen+%22Dependency+Dashboard%22"
