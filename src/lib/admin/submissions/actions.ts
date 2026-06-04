'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { logAdminAction } from '@/lib/admin/audit'
import { createAdminClient } from '@/lib/supabase/server'
import { STORY_SUBMISSIONS_BUCKET } from '@/api/admin/submissions'

export type DownloadResult = { status: 'ok'; url: string } | { status: 'error'; message: string }
export type SubmissionActionResult = { status: 'ok' } | { status: 'error'; message: string }

function safePath(path: string | null): string | null {
  if (!path || path.includes('..')) return null
  // Expect "{userId}/{file}".
  return /^[^/]+\/[^/]+$/.test(path) ? path : null
}

export async function getSubmissionDownloadUrlAction(formData: FormData): Promise<DownloadResult> {
  await requireAdmin()
  const path = safePath(formData.get('path') as string | null)
  if (!path) return { status: 'error', message: 'Неверный путь.' }

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from(STORY_SUBMISSIONS_BUCKET)
    .createSignedUrl(path, 60 * 60, { download: true })
  if (error || !data) return { status: 'error', message: error?.message ?? 'Не удалось создать ссылку.' }
  return { status: 'ok', url: data.signedUrl }
}

export async function deleteSubmissionAction(formData: FormData): Promise<SubmissionActionResult> {
  const user = await requireAdmin()
  const path = safePath(formData.get('path') as string | null)
  if (!path) return { status: 'error', message: 'Неверный путь.' }

  const admin = createAdminClient()
  const { error } = await admin.storage.from(STORY_SUBMISSIONS_BUCKET).remove([path])
  if (error) return { status: 'error', message: error.message }

  await logAdminAction({
    actorUserId: user.id,
    action: 'submission.delete',
    entityType: 'submission',
    entityId: path,
    summary: `Удалена заявка ${path}`,
  })
  revalidatePath('/admin/submissions')
  return { status: 'ok' }
}
