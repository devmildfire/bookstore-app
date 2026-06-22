// Render coverage-summary.json (Vitest json-summary reporter) as a Markdown
// table for the GitHub Actions job summary.
//
//   node scripts/coverage-summary.mjs coverage/coverage-summary.json >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from 'node:fs'

const file = process.argv[2] || 'coverage/coverage-summary.json'

let total
try {
  total = JSON.parse(readFileSync(file, 'utf8')).total
} catch {
  console.log('### 📊 Coverage\n\n> ⚠️ No coverage summary file produced.\n')
  process.exit(0)
}

const row = (k) => `| ${k[0].toUpperCase() + k.slice(1)} | ${total[k].pct}% | ${total[k].covered}/${total[k].total} |`

console.log(
  [
    '### 📊 Coverage (whole repo)',
    '',
    '| Metric | % | Covered |',
    '|:--|--:|--:|',
    row('lines'),
    row('statements'),
    row('functions'),
    row('branches'),
    '',
    '_Gated (ratchet, only ever rises) on **lines + statements**. Branches/functions are reported, not gated._',
    '',
  ].join('\n'),
)
