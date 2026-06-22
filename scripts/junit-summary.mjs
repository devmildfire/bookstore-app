// Render a JUnit XML report as a Markdown table for the GitHub Actions job
// summary. Used by the test workflows (Vitest + Playwright both emit JUnit).
// No deps — JUnit is simple and attribute values are entity-escaped, so a
// regex pass over <testcase> elements is safe.
//
//   node scripts/junit-summary.mjs <results.junit.xml> "<title>" >> "$GITHUB_STEP_SUMMARY"
import { readFileSync } from 'node:fs'

const [file, title = 'Tests'] = process.argv.slice(2)

const unescape = (s = '') =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#10;/g, ' ')
    .replace(/&#13;/g, '')
    .replace(/&amp;/g, '&') // ampersand last

let xml
try {
  xml = readFileSync(file, 'utf8')
} catch {
  console.log(`## ${title}\n\n> ⚠️ No results file (\`${file}\`) — the run likely failed before tests executed.\n`)
  process.exit(0)
}

const cases = []
const re = /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g
let m
while ((m = re.exec(xml))) {
  const attrs = m[1]
  const body = m[2] || ''
  const attr = (n) => {
    // \b so `name` doesn't also match inside `classname`
    const a = attrs.match(new RegExp(`\\b${n}="([^"]*)"`))
    return a ? unescape(a[1]) : ''
  }
  let status = 'pass'
  let message = ''
  if (/<failure\b/.test(body) || /<error\b/.test(body)) {
    status = 'fail'
    const fm = body.match(/<(?:failure|error)\b([^>]*)>/)
    const mm = fm && fm[1].match(/message="([^"]*)"/)
    message = mm ? unescape(mm[1]) : ''
  } else if (/<skipped\b/.test(body)) {
    status = 'skip'
  }
  cases.push({ name: attr('name'), file: attr('classname'), time: parseFloat(attr('time') || '0'), status, message })
}

const count = (s) => cases.filter((c) => c.status === s).length
const passed = count('pass')
const failed = count('fail')
const skipped = count('skip')
const totalTime = cases.reduce((s, c) => s + c.time, 0)
const cell = (s) => s.replace(/\|/g, '\\|')
const icon = { pass: '✅', fail: '❌', skip: '⏭️' }

const out = []
out.push(`## ${title}`)
out.push('')
out.push(
  `${failed ? '❌ **Failed**' : '✅ **Passed**'} — ${cases.length} tests · ✅ ${passed} passed` +
    (failed ? ` · ❌ ${failed} failed` : '') +
    (skipped ? ` · ⏭️ ${skipped} skipped` : '') +
    ` · ⏱️ ${totalTime.toFixed(2)}s`,
)
out.push('')

if (failed) {
  out.push('### ❌ Failures')
  out.push('')
  for (const c of cases.filter((c) => c.status === 'fail')) {
    out.push(`- **${c.name}** — \`${c.file}\``)
    if (c.message) out.push('  ```\n  ' + c.message.split('\n').join('\n  ') + '\n  ```')
  }
  out.push('')
}

out.push(`<details${failed ? '' : ' open'}><summary>All ${cases.length} tests</summary>`)
out.push('')
out.push('| | Test | Time |')
out.push('|:--:|:--|--:|')
for (const c of cases) {
  out.push(`| ${icon[c.status]} | ${cell(c.name)} | ${c.time.toFixed(3)}s |`)
}
out.push('')
out.push('</details>')
out.push('')

console.log(out.join('\n'))
