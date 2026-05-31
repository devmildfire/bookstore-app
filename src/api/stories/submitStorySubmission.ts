import { createClient } from '@/lib/supabase/client'
import {
  validateStoryFile,
  STORY_FILE_ERROR_MESSAGES,
} from '@/entities/story/validation'

const STORY_BUCKET = 'story-submissions'

export type StorySubmissionInput = {
  file: File
  authorName: string
  coverLetter?: string
}

export type StorySubmissionResult =
  | { status: 'ok'; path: string }
  | { status: 'error'; message: string }

// Reduce an arbitrary (possibly Cyrillic) string to an ASCII slug safe for a
// Storage object key. Empty results fall back to a default.
function slug(value: string, fallback: string): string {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return cleaned || fallback
}

/**
 * Upload a story manuscript to the private `story-submissions` bucket for
 * later editorial review. The object key is `{user_id}/{ts}-{author}-{file}`,
 * so the first folder segment is the owner (matches the bucket RLS). The
 * author name slug is carried in the key for at-a-glance identification.
 *
 * Author name / cover-letter persistence beyond the filename is out of scope
 * for now (no submissions table yet) — the file lands in storage and is
 * validated by type + size; the rest of the metadata is collected for when a
 * review workflow is built.
 */
export async function submitStorySubmission({
  file,
  authorName,
}: StorySubmissionInput): Promise<StorySubmissionResult> {
  const fileError = validateStoryFile(file)
  if (fileError) {
    return { status: 'error', message: STORY_FILE_ERROR_MESSAGES[fileError] }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { status: 'error', message: 'Не удалось определить пользователя.' }
  }

  const author = slug(authorName, 'anon')
  const fileName = slug(file.name, 'story')
  const path = `${user.id}/${Date.now()}-${author}-${fileName}`

  const { error } = await supabase.storage.from(STORY_BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  })
  if (error) {
    return { status: 'error', message: `Не удалось отправить: ${error.message}` }
  }

  return { status: 'ok', path }
}
