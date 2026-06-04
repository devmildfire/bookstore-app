import { createAdminClient } from '@/lib/supabase/server'

export const STORY_SUBMISSIONS_BUCKET = 'story-submissions'

export type AdminSubmission = {
  path: string
  name: string
  userId: string
  sizeBytes: number | null
  createdAt: string | null
  authorName: string | null
  coverLetter: string | null
}

// Suffix of the JSON sidecar that carries the author name + cover letter for a
// manuscript (see submitStorySubmission). It is not itself a submission.
const META_SUFFIX = '.meta.json'

// Download and parse a manuscript's `.meta.json` sidecar, if present. Best
// effort — a missing or malformed sidecar just yields null fields.
async function readSidecar(
  admin: ReturnType<typeof createAdminClient>,
  path: string
): Promise<{ authorName: string | null; coverLetter: string | null }> {
  try {
    const { data, error } = await admin.storage.from(STORY_SUBMISSIONS_BUCKET).download(`${path}${META_SUFFIX}`)
    if (error || !data) return { authorName: null, coverLetter: null }
    const parsed = JSON.parse(await data.text()) as { authorName?: unknown; coverLetter?: unknown }
    return {
      authorName: typeof parsed.authorName === 'string' && parsed.authorName.trim() ? parsed.authorName : null,
      coverLetter: typeof parsed.coverLetter === 'string' && parsed.coverLetter.trim() ? parsed.coverLetter : null,
    }
  } catch {
    return { authorName: null, coverLetter: null }
  }
}

// Story submissions are files in a private bucket under {user_id}/… (there's no
// DB table). List every user folder's files into one flat, newest-first list.
export async function getStorySubmissions(): Promise<AdminSubmission[]> {
  const admin = createAdminClient()
  const { data: folders } = await admin.storage
    .from(STORY_SUBMISSIONS_BUCKET)
    .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

  const out: AdminSubmission[] = []
  for (const folder of folders ?? []) {
    // Folders (prefixes) have a null id; real files at the root are ignored.
    if (folder.id) continue
    const userId = folder.name
    const { data: files } = await admin.storage
      .from(STORY_SUBMISSIONS_BUCKET)
      .list(userId, { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })
    for (const f of files ?? []) {
      if (!f.name || !f.id) continue
      if (f.name.endsWith(META_SUFFIX)) continue // sidecar, not a submission
      const size = (f.metadata as { size?: number } | null)?.size ?? null
      const path = `${userId}/${f.name}`
      const { authorName, coverLetter } = await readSidecar(admin, path)
      out.push({
        path,
        name: f.name,
        userId,
        sizeBytes: size,
        createdAt: f.created_at ?? null,
        authorName,
        coverLetter,
      })
    }
  }

  out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return out
}
