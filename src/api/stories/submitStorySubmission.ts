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
 * There is no submissions DB table; the manuscript lives in storage and is
 * validated by type + size. The author name and cover letter are persisted as
 * a small `{path}.meta.json` sidecar in the same folder (the upload RLS already
 * scopes the folder to the owner), so the editorial panel can show them.
 */
export async function submitStorySubmission({
  file,
  authorName,
  coverLetter,
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

  // Persist the author's name + cover letter alongside the manuscript. Best
  // effort: the manuscript is already saved, so a sidecar failure must not fail
  // the submission.
  const sidecar = JSON.stringify({
    authorName,
    coverLetter: coverLetter ?? '',
    submittedAt: new Date().toISOString(),
  })
  await supabase.storage
    .from(STORY_BUCKET)
    .upload(`${path}.meta.json`, new Blob([sidecar], { type: 'application/json' }), {
      contentType: 'application/json',
      upsert: true,
    })

  return { status: 'ok', path }
}
