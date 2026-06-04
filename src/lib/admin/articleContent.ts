// Convert article content_blocks ↔ a plain-text editor value, so admins type
// paragraphs (separated by blank lines) instead of editing JSON. Images are
// preserved via a simple marker line so round-tripping never drops them.
//
//   paragraph block  →  the text, blank line between paragraphs
//   image block      →  «[img: file.png | подпись]» on its own line
//
// Client-safe: pure functions, no server imports (used by the form + action).

export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'image'; path: string; caption: string | null }

// One image marker occupying a whole paragraph segment.
const IMAGE_RE = /^\[img:\s*([^|\]]+?)\s*(?:\|\s*([\s\S]*?))?\]$/i

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}
function asString(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

// content_blocks (JSON) → editor text.
export function blocksToText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return ''
  const parts: string[] = []
  for (const raw of blocks) {
    const b = asRecord(raw)
    if (!b) continue
    if (b.kind === 'paragraph') {
      parts.push(asString(b.text))
    } else if (b.kind === 'image') {
      const path = asString(b.path)
      const caption = asString(b.caption)
      parts.push(caption ? `[img: ${path} | ${caption}]` : `[img: ${path}]`)
    }
  }
  return parts.join('\n\n')
}

// Editor text → content_blocks (JSON). Segments are split on blank lines.
export function textToBlocks(input: string): ContentBlock[] {
  // Browsers submit textarea newlines as CRLF — normalize before splitting.
  const text = input.replace(/\r\n?/g, '\n')
  const segments = text.split(/\n[ \t]*\n+/)
  const blocks: ContentBlock[] = []
  for (const segment of segments) {
    const seg = segment.trim()
    if (!seg) continue
    const m = seg.match(IMAGE_RE)
    if (m) {
      const caption = m[2]?.trim()
      blocks.push({ kind: 'image', path: m[1].trim(), caption: caption ? caption : null })
    } else {
      blocks.push({ kind: 'paragraph', text: seg })
    }
  }
  return blocks
}
