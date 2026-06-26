import { createWriteStream, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// Output dir is co-located with the harness (scripts/stress-test/stress-results),
// independent of where the runner is invoked from — keeps it under the local
// .gitignore regardless of cwd.
const RESULTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'stress-results')

export function createReporter() {
  const log = []
  let stream
  let filePath

  function open() {
    if (stream) return
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const dir = RESULTS_DIR
    mkdirSync(dir, { recursive: true })
    filePath = join(dir, `stress-results-${ts}.jsonl`)
    stream = createWriteStream(filePath, { flags: 'a' })
  }

  function record(entry) {
    if (!stream) open()
    const line = JSON.stringify(entry) + '\n'
    log.push(entry)
    try { stream.write(line) } catch {}
  }

  function summarize(startTime) {
    if (!stream) open()
    const duration = Math.round((Date.now() - startTime) / 1000)
    const actions = log.filter(e => e.ok !== undefined)
    const ok = actions.filter(e => e.ok).length
    const errs = actions.filter(e => !e.ok).length
    const orders = log.filter(e => e.action === 'checkout_confirm' && e.ok).length

    const lines = [
      '',
      '=== Stress test complete ===',
      `Duration: ${Math.floor(duration / 60)}m ${duration % 60}s`,
      `Results: ${filePath}`,
      `Actions: ${actions.length} total, ${ok} ok, ${errs} errors${actions.length ? ` (${(errs / actions.length * 100).toFixed(2)}%)` : ''}`,
      `Orders created: ${orders}`,
      '',
    ]
    console.log(lines.join('\n'))
  }

  return { record, summarize }
}
