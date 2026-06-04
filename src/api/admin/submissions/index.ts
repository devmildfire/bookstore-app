import { createAdminClient } from '@/lib/supabase/server'

export const STORY_SUBMISSIONS_BUCKET = 'story-submissions'

export type AdminSubmission = {
  path: string
  name: string
  userId: string
  sizeBytes: number | null
  createdAt: string | null
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
      const size = (f.metadata as { size?: number } | null)?.size ?? null
      out.push({
        path: `${userId}/${f.name}`,
        name: f.name,
        userId,
        sizeBytes: size,
        createdAt: f.created_at ?? null,
      })
    }
  }

  out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return out
}
