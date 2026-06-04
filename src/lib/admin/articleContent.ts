// Article content_blocks helpers. The admin edits content in a Lexical editor
// that serializes to this shape; these validate/coerce arbitrary JSON into it.
// Client-safe: pure functions, no server imports.

export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'image'; path: string; caption: string | null }

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}
function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

// Coerce an arbitrary value (e.g. a DB content_blocks column) into valid blocks.
export function coerceBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return []
  const out: ContentBlock[] = []
  for (const item of value) {
    const b = asRecord(item)
    if (!b) continue
    if (b.kind === 'paragraph') {
      const text = asString(b.text)
      if (text.trim()) out.push({ kind: 'paragraph', text })
    } else if (b.kind === 'image') {
      const path = asString(b.path)
      if (path) out.push({ kind: 'image', path, caption: asString(b.caption) || null })
    }
  }
  return out
}

// Parse the editor's serialized JSON string into validated blocks.
export function parseContentBlocks(json: string): ContentBlock[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return []
  }
  return coerceBlocks(parsed)
}
