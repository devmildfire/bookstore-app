// Validation rules for a story-submission upload (the "Отправить рассказ"
// modal). The journal accepts manuscript documents only, capped at 4 MB.

export const STORY_MAX_BYTES = 4 * 1024 * 1024 // 4 MB
export const STORY_MAX_MB = 4

// Accepted manuscript formats. EPUB and especially FB2 frequently arrive with
// an empty or inconsistent `File.type` from the browser, so the extension is
// the source of truth; MIME types are a best-effort hint for the file picker.
export const STORY_ALLOWED_EXTENSIONS = ['doc', 'docx', 'epub', 'fb2'] as const
export type StoryExtension = (typeof STORY_ALLOWED_EXTENSIONS)[number]

export const STORY_ALLOWED_MIME_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/epub+zip',
  'application/x-fictionbook+xml',
] as const

// `accept` attribute for the hidden <input type="file">. Extensions first
// (reliable), MIME types appended for pickers that prefer them.
export const STORY_ACCEPT = [
  ...STORY_ALLOWED_EXTENSIONS.map((ext) => `.${ext}`),
  ...STORY_ALLOWED_MIME_TYPES,
].join(',')

export function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  return dot === -1 ? '' : filename.slice(dot + 1).toLowerCase()
}

export type StoryFileError = 'type' | 'size'

/**
 * Validate a chosen story file by extension and size.
 * Returns `null` when valid, or an error kind otherwise.
 */
export function validateStoryFile(file: File): StoryFileError | null {
  const ext = getFileExtension(file.name)
  if (!(STORY_ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) return 'type'
  if (file.size > STORY_MAX_BYTES) return 'size'
  return null
}

export const STORY_FILE_ERROR_MESSAGES: Record<StoryFileError, string> = {
  type: 'Только doc, docx, epub или fb2.',
  size: `Файл больше ${STORY_MAX_MB} МБ.`,
}
